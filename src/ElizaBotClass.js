const { initCap, pickRandom } = require('./utils');
const ElizaMemory = require('./elizaMemory');
const langConfig = require('./languageConfig');
const regExMaker = require('./regExMaker');
const SimpleReplacements = require('./SimpleReplacements');

const { NO_MATCH_KEYWORD } = langConfig;

class ElizaBot {
  version = null;

  // #region options
  #capitalizeFirstLetterEnabled = false;

  #debugEnabled = false;

  #noRandomResponsesEnabled = false;
  // #endregion

  quit = false;

  keywordsList = null;

  postTransformsList = null;

  /** 2-Dimensional array of last {responseIndex} `[{keywordIndex}][{phraseIndex}]` */
  lastchoice = [];

  #elizaMemory = false;

  #dataParsed = false;

  /**
   * Applies simple substitution rules to the reassembly rule.
   * This is where all the ``I'''s and ``you'''s are exchanged.
   * @type SimpleReplacements
   */
  #elizaPosts = null;

  /**
   * Applied to user-input text, BEFORE any processing, and before a reassebly statement has been selected.
   * @type SimpleReplacements
   */
  #elizaPres = null;

  /**
   * @param {object} opts
   * @param {boolean} opts.debugEnabled
   * @param {boolean} opts.noRandom
   */
  constructor(opts) {
    this.keywordsList = langConfig.keywords;
    this.postTransformsList = langConfig.postTransforms;

    const { debugEnabled, noRandom } = opts || {};
    this.#noRandomResponsesEnabled = Boolean(noRandom);
    this.#capitalizeFirstLetterEnabled = true;
    this.#debugEnabled = Boolean(debugEnabled);

    this.version = '1.1 (original)';

    this.#elizaMemory = new ElizaMemory(opts);
    this.#dataParsed = false;
    if (!this.#dataParsed) {
      this.#init();
      this.#dataParsed = true;
    }
    this.reset();
  }

  reset() {
    this.quit = false;
    this.#elizaMemory.reset();
    this.lastchoice = [];

    for (let keywordIndex = 0; keywordIndex < this.keywordsList.length; keywordIndex++) {
      this.lastchoice[keywordIndex] = [];
      const { phrases } = this.keywordsList[keywordIndex];
      for (let phraseIndex = 0; phraseIndex < phrases.length; phraseIndex++) {
        this.lastchoice[keywordIndex][phraseIndex] = -1;
      }
    }
  }

  #init() {
    this.#expandKeywords();

    // and compose regexps and refs for pres and posts
    this.#elizaPosts = new SimpleReplacements(langConfig.post);
    this.#elizaPres = new SimpleReplacements(langConfig.pres);

    // check for langConfig.quitCommands and install default if missing
    if (!Array.isArray(langConfig.quitCommands)) {
      langConfig.quitCommands = [];
    }

    // done
    this.#dataParsed = true;
  }

  /**
   * Parse langConfig data and convert it from canonical form to internal use
   *
   * ### Adds:
   *
   * * `keyword.originalIndex`
   * * `phrase.regEx`
   * * defaults `phrase.saveForLater` to false if not set in data;
   */
  #expandKeywords() {
    // check for keywords or install empty structure to prevent any errors
    if (!Array.isArray(this.keywordsList) || !this.keywordsList.length) {
      this.keywordsList = [{
        keyword: '###',
        originalIndex: 0,
        weight: 0,
        phrases: [{
          pattern: '###',
          regEx: null,
          saveForLater: false,
          responses: [],
        }],
      }];
    }

    regExMaker.init();

    /* eslint-disable no-param-reassign */
    // expand synonyms and insert asterisk expressions for backtracking
    this.keywordsList.forEach((keywordEntry, k) => {
      // save original index for sorting
      keywordEntry.originalIndex = k;
      keywordEntry.phrases.forEach((thisPhrase) => {
        Object.assign(thisPhrase, {
          regEx: regExMaker.make(thisPhrase.pattern),
          saveForLater: thisPhrase.saveForLater === true,
        });
      });
    });
    /* eslint-enable no-param-reassign */

    // now sort keywords by weight (highest first)
    this.keywordsList.sort(ElizaBot.#sortKeywords);
  }

  static #sortKeywords(a, b) {
    if (a.weight > b.weight) return -1;
    if (a.weight < b.weight) return 1;

    if (a.originalIndex > b.originalIndex) return 1;
    if (a.originalIndex < b.originalIndex) return -1;

    return 0;
  }

  /**
   * Split text in partial sentences.
   *
   * * strips noise (characters such as "$", "(")
   * * compacts whitespace
   * * fragments at each break (such as "but", ".", ",", "?", "-")
   *
   * @returns {[string]} Returns array of compacted sentenence fragments/parts:
   */
  static #getSentenceFrags(inputText) {
    return inputText.toLowerCase()
      .replace(/@#\$%\^&\*\(\)_\+=~`\{\[\}\]\|:;<>\/\\\t/g, ' ')
      .replace(/\s+-+\s+/g, '.')
      .replace(/\s*[,.?!;]+\s*/g, '.')
      .replace(/\s*\bbut\b\s*/g, '.')
      .replace(/\s{2,}/g, ' ')
      .split('.')
      .map((t) => t.trim())
      .filter(Boolean);
  }

  #checkKeywordsReply(parts) {
    let reply = '';

    parts.some((part) => {
      const sentence = this.#elizaPres.doSubstitutions(part);
      return this.keywordsList.some(({ keyword }, keywordIdx) => {
        if (sentence.search(new RegExp(`\\b${keyword}\\b`, 'i')) >= 0) {
          reply = this.#execRule(sentence, keywordIdx);
        }
        return reply;
      });
    });

    return reply;
  }

  getReply(inputText) {
    const parts = ElizaBot.#getSentenceFrags(inputText);

    // check for quit expression
    this.quit = parts.length === 1 && langConfig.quitCommands.includes(parts[0]);
    if (this.quit) {
      return this.getFarewell();
    }

    // Find reply based on a Keyword.
    // Nothing matched? Try memory.
    // Nothing in memory? Get "no match" response.
    // Ugh?! Still nothing? Use a hardcoded reply.
    return this.#checkKeywordsReply(parts)
      || this.#elizaMemory.get()
      || this.getNoMatchReply()
      || 'I am at a loss for words.';
  }

  getNoMatchReply() {
    const sentence = ' ';
    const keywordIdx = this.#getRuleIndexByKey(NO_MATCH_KEYWORD);
    return keywordIdx >= 0 ? this.#execRule(sentence, keywordIdx) : '';
  }

  #getNextResponse(keywordIndex, phraseIndex, responses) {
    let index = this.#noRandomResponsesEnabled ? 0 : Math.floor(Math.random() * responses.length);
    const lastIndex = this.lastchoice[keywordIndex][phraseIndex];

    if ((this.#noRandomResponsesEnabled && lastIndex > index) || (lastIndex === index)) {
      index = lastIndex + 1;
      if (index >= responses.length) {
        index = 0;
        this.lastchoice[keywordIndex][phraseIndex] = -1;
      }
    } else {
      this.lastchoice[keywordIndex][phraseIndex] = index;
    }

    return responses[index];
  }

  /**
   * Replaces placeholders within `reply` with corresponding values from `m`
   * @param {[string]} m
   * @param {string} reply
   * @returns {string}
   * @example
   * const m = ['I like thanksgiving turkeys', 'thanksgiving']
   * const reply = #substitutePositionalParams(m, "Do you say (1) for some special reason ?");
   * // reply is "Do you say thanksgiving for some special reason ?"
   *
   * const m = ['my cake tastes sad', 'cake', 'cake tastes sad']
   * const reply = #substitutePositionalParams(m, "Lets discuss further why your (2).");
   * // reply is "Lets discuss further why your cake tastes sad."
   */
  #substitutePositionalParams(m, reply) {
    const paramRegEx = /\(([0-9]+)\)/g;
    if (!paramRegEx.test(reply)) {
      return reply;
    }

    return reply.replace(paramRegEx, (match, matcheParmNbr) => {
      const phrase = m[parseInt(matcheParmNbr, 10)];
      return this.#elizaPosts.doSubstitutions(phrase);
    });
  }

  /**
   * @param {int} keywordIdx
   * @returns {string} statement
   */
  #execRule(sentence, keywordIdx) {
    const { keyword, phrases, weight } = this.keywordsList[keywordIdx];

    let reply = '';

    phrases.some((phrase, phraseIdx) => {
      const matches = sentence.match(phrase.regEx);
      if (!matches) {
        return false;
      }

      reply = this.#getNextResponse(keywordIdx, phraseIdx, phrase.responses);
      if (this.#debugEnabled) {
        // eslint-disable-next-line no-console
        console.log(`execRule match:\n  key: ${keyword}\n  weight: ${weight}\n  pattern: ${phrase.pattern}\n  regEx: ${phrase.regEx}\n  reasmb: ${reply}\n  saveForLater: ${phrase.saveForLater}`);
      }

      if (reply.applyKeyword) {
        const gotoIdx = this.#getRuleIndexByKey(reply.applyKeyword);
        reply = gotoIdx > -1 ? this.#execRule(sentence, gotoIdx) : this.getNoMatchReply();
        return true;
      }

      reply = this.#substitutePositionalParams(matches, reply);
      reply = this.#finalizeReply(reply);
      if (phrase.saveForLater) {
        this.#elizaMemory.save(reply);
        return false;
      }

      return true;
    });

    return reply;
  }

  /* eslint-disable no-param-reassign */
  /**
   * Compact and apply `postTransformsList` substitutions. This is the last tidy-up performed before sending reply to user.
   */
  #finalizeReply(text) {
    text = text
      .replace(/\s{2,}/g, ' ')
      .replace(/\s+([.?!])/g, '$1');

    if (Array.isArray(this.postTransformsList)) {
      this.postTransformsList.forEach(({ pattern, replacement }) => {
        text = text.replace(pattern, replacement);
      });
    }

    return this.#capitalizeFirstLetterEnabled ? initCap(text) : text;
  }
  /* eslint-enable no-param-reassign */

  #getRuleIndexByKey(key) {
    return this.keywordsList.findIndex(({ keyword }) => keyword === key);
  }

  // eslint-disable-next-line class-methods-use-this
  getFarewell() {
    return pickRandom(langConfig.farewells);
  }

  // eslint-disable-next-line class-methods-use-this
  getGreeting() {
    return pickRandom(langConfig.greetings);
  }
}

module.exports = ElizaBot;
