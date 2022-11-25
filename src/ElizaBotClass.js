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

  postsHash = null;

  postTransformsList = null;

  /** 2-Dimensional array of last {responseIndex} `[{keywordIndex}][{phraseIndex}]` */
  lastchoice = [];

  sentence = '';

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
    this.postsHash = langConfig.post;

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

  /** parse data and convert it from canonical form to internal use */
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
          useMemFlag: false,
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
        const { regEx, useMemFlag } = regExMaker.make(thisPhrase.pattern);

        Object.assign(thisPhrase, {
          regEx,
          useMemFlag,
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
      // eslint-disable-next-line no-param-reassign
      part = this.#elizaPres.doSubstitutions(part);
      this.sentence = part;

      return this.keywordsList.some(({ keyword }, keywordIdx) => {
        if (part.search(new RegExp(`\\b${keyword}\\b`, 'i')) >= 0) {
          reply = this.#execRule(keywordIdx);
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
    this.sentence = ' ';
    const index = this.#getRuleIndexByKey(NO_MATCH_KEYWORD);
    return index >= 0 ? this.#execRule(index) : '';
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
   * @param {int} keywordIdx
   * @returns {string} statement
   */
  #execRule(keywordIdx) {
    const paramRegEx = /\(([0-9]+)\)/;
    const { keyword, phrases, weight } = this.keywordsList[keywordIdx];
    for (let phraseIndex = 0; phraseIndex < phrases.length; phraseIndex++) {
      const thisPhrase = phrases[phraseIndex];
      const m = this.sentence.match(thisPhrase.regEx);
      if (m !== null) {
        const { responses, useMemFlag } = thisPhrase;

        let reply = this.#getNextResponse(keywordIdx, phraseIndex, responses);
        if (this.#debugEnabled) {
          // eslint-disable-next-line no-console
          console.log(`execRule match:\n  key: ${keyword}\n  weight: ${weight}\n  pattern: ${thisPhrase.pattern}\n  regEx: ${thisPhrase.regEx}\n  reasmb: ${reply}\n  useMemFlag: ${useMemFlag}`);
        }

        if (reply.goto) {
          const index = this.#getRuleIndexByKey(reply.goto);
          return this.#execRule(index > -1 ? index : this.#getRuleIndexByKey(NO_MATCH_KEYWORD));
        }

        // substitute positional params
        let posParamMatches = paramRegEx.exec(reply);
        if (posParamMatches) {
          let leftPart = '';
          let rightPart = reply;
          while (posParamMatches) {
            let param = m[parseInt(posParamMatches[1], 10)];
            param = this.#elizaPosts.doSubstitutions(param);
            leftPart += rightPart.substring(0, posParamMatches.index) + param;
            rightPart = rightPart.substring(posParamMatches.index + posParamMatches[0].length);
            posParamMatches = paramRegEx.exec(rightPart);
          }
          reply = leftPart + rightPart;
        }

        reply = this.#postTransform(reply);
        if (useMemFlag) {
          this.#elizaMemory.save(reply);
        } else {
          return reply;
        }
      }
    }
    return '';
  }

  /* eslint-disable no-param-reassign */
  #postTransform(text) {
    // final cleanings
    text = text
      .replace(/\s{2,}/g, ' ')
      .replace(/\s+\./g, '.');

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
