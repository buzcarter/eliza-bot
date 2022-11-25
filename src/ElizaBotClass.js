const { initCap, pickRandom } = require('./utils');
const ElizaMemory = require('./elizaMemory');
const regExMaker = require('./regExMaker');
const SimpleReplacements = require('./SimpleReplacements');

/**
 * The expanded internal Keyword Phrase Object
 * @typedef {Object} PhraseObj
 * @property {string} pattern
 * @property {string} regEx
 * @property {boolean} saveForLater
 * @property {[string|object]} responses either 'Have you eaten (2) before?' or Oject '{ applyKeyword: 'dream' }'
 */

/**
 * The expanded internal Keyword Object
 * @typedef {Object} KeywordObj
 * @property {string} keyword
 * @property {integer} originalIndex
 * @property {int} weight
 * @property {[PhraseObj]} phrases
 */

class ElizaBot {
  version = '1.1.1 (adapted for Node 16 (ECMAScript 2020))';

  // #region options
  #capitalizeFirstLetterEnabled = false;

  #debugEnabled = false;

  #noRandomResponsesEnabled = false;
  // #endregion

  quit = false;

  /** @type [KeywordObj] */
  #keywordsList = null;

  #postTransformsList = null;

  /** 2-Dimensional array of last {responseIndex} `[{keywordIndex}][{phraseIndex}]` */
  #lastchoice = [];

  #farewells = [];

  #greetings = [];

  #memory = false;

  #quitCommands = ['quit'];

  #NO_MATCH_KEYWORD = 'NOTFOUND';

  /**
   * Applies simple substitution rules to the reassembly rule.
   * This is where all the `I's` and `you's` are exchanged.
   * @type SimpleReplacements
   */
  #replyPositionalSubstitutions = null;

  /**
   * Applied to user-input text, BEFORE any processing, and before a reassebly statement has been selected.
   * @type SimpleReplacements
   */
  #inputPreSubstitutions = null;

  /**
   * @param {object} opts
   * @param {boolean} opts.debugEnabled
   * @param {boolean} opts.noRandom
   */
  constructor(opts) {
    // eslint-disable-next-line no-param-reassign
    opts = opts || {};

    this.#capitalizeFirstLetterEnabled = true;
    this.#debugEnabled = Boolean(opts.debugEnabled);
    this.#noRandomResponsesEnabled = Boolean(opts.noRandom);

    this.#NO_MATCH_KEYWORD = opts.NO_MATCH_KEYWORD || 'NOTFOUND';

    this.#farewells = opts.farewells;
    this.#greetings = opts.greetings;
    this.#postTransformsList = opts.postTransforms;

    this.#keywordsList = ElizaBot.#loadKeywords(opts.keywords);
    this.#memory = new ElizaMemory({ noRandom: opts.noRandom });
    this.#replyPositionalSubstitutions = new SimpleReplacements(opts.post);
    this.#inputPreSubstitutions = new SimpleReplacements(opts.pres);

    if (Array.isArray(opts.quitCommands) && opts.quitCommands.length) {
      this.#quitCommands = opts.quitCommands;
    }

    this.reset();
  }

  reset() {
    this.quit = false;
    this.#memory.reset();
    this.#lastchoice = [];

    for (let keywordIndex = 0; keywordIndex < this.#keywordsList.length; keywordIndex++) {
      this.#lastchoice[keywordIndex] = [];
      const { phrases } = this.#keywordsList[keywordIndex];
      for (let phraseIndex = 0; phraseIndex < phrases.length; phraseIndex++) {
        this.#lastchoice[keywordIndex][phraseIndex] = -1;
      }
    }
  }

  /* eslint-disable no-param-reassign */
  /**
   * Parse keyword definitions and convert it from canonical form to internal use
   *
   * ### Adds:
   *
   * * `keyword.originalIndex`
   * * `phrase.regEx`
   * * defaults `phrase.saveForLater` to false if not set in data;
   *
   * @returns {[KeywordObj]}
   */
  static #loadKeywords(keywordDefs) {
    // check for keywords or install empty structure to prevent any errors
    if (!Array.isArray(keywordDefs) || !keywordDefs.length) {
      keywordDefs = [{
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

    // expand synonyms and insert asterisk expressions for backtracking
    keywordDefs.forEach((keywordEntry, k) => {
      // save original index for sorting
      keywordEntry.originalIndex = k;
      keywordEntry.phrases.forEach((thisPhrase) => {
        Object.assign(thisPhrase, {
          regEx: regExMaker.make(thisPhrase.pattern),
          saveForLater: thisPhrase.saveForLater === true,
        });
      });
    });

    // now sort keywords by weight (highest first)
    return keywordDefs.sort(ElizaBot.#sortKeywords);
  }
  /* eslint-enable no-param-reassign */

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
      const sentence = this.#inputPreSubstitutions.doSubstitutions(part);
      return this.#keywordsList.some(({ keyword }, keywordIdx) => {
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
    this.quit = parts.length === 1 && this.#quitCommands.includes(parts[0]);
    if (this.quit) {
      return this.getFarewell();
    }

    // Find reply based on a Keyword.
    // Nothing matched? Try memory.
    // Nothing in memory? Get "no match" response.
    // Ugh?! Still nothing? Use a hardcoded reply.
    return this.#checkKeywordsReply(parts)
      || this.#memory.get()
      || this.getNoMatchReply()
      || 'I am at a loss for words.';
  }

  getNoMatchReply() {
    const sentence = ' ';
    const keywordIdx = this.#getRuleIndexByKey(this.#NO_MATCH_KEYWORD);
    return keywordIdx >= 0 ? this.#execRule(sentence, keywordIdx) : '';
  }

  #getNextResponse(keywordIndex, phraseIndex, responses) {
    let index = this.#noRandomResponsesEnabled ? 0 : Math.floor(Math.random() * responses.length);
    const lastIndex = this.#lastchoice[keywordIndex][phraseIndex];

    if ((this.#noRandomResponsesEnabled && lastIndex > index) || (lastIndex === index)) {
      index = lastIndex + 1;
      if (index >= responses.length) {
        index = 0;
        this.#lastchoice[keywordIndex][phraseIndex] = -1;
      }
    } else {
      this.#lastchoice[keywordIndex][phraseIndex] = index;
    }

    return responses[index];
  }

  /**
   * Replaces placeholders within `reply` with corresponding values from `m`
   * @param {[string]} patternMatches
   * @param {string} reply
   * @returns {string}
   * @example
   * const matches = ['I like thanksgiving turkeys', 'thanksgiving']
   * const reply = #substitutePositionalParams(matches, "Do you say (1) for some special reason ?");
   * // reply is "Do you say thanksgiving for some special reason ?"
   *
   * const matches = ['my cake tastes sad', 'cake', 'cake tastes sad']
   * const reply = #substitutePositionalParams(matches, "Lets discuss further why your (2).");
   * // reply is "Lets discuss further why your cake tastes sad."
   */
  #substitutePositionalParams(patternMatches, reply) {
    const paramNbrRegEx = /\(([0-9]+)\)/g;
    if (!paramNbrRegEx.test(reply)) {
      return reply;
    }

    return reply.replace(paramNbrRegEx, (match, paramNbr) => {
      const phrase = patternMatches[parseInt(paramNbr, 10)];
      return this.#replyPositionalSubstitutions.doSubstitutions(phrase);
    });
  }

  /**
   * @param {int} keywordIdx
   * @returns {string} statement
   */
  #execRule(sentence, keywordIdx) {
    const { keyword, phrases, weight } = this.#keywordsList[keywordIdx];

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
        this.#memory.save(reply);
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

    if (Array.isArray(this.#postTransformsList)) {
      this.#postTransformsList.forEach(({ pattern, replacement }) => {
        text = text.replace(pattern, replacement);
      });
    }

    return this.#capitalizeFirstLetterEnabled ? initCap(text) : text;
  }
  /* eslint-enable no-param-reassign */

  #getRuleIndexByKey(key) {
    return this.#keywordsList.findIndex(({ keyword }) => keyword === key);
  }

  // eslint-disable-next-line class-methods-use-this
  getFarewell() {
    return pickRandom(this.#farewells);
  }

  // eslint-disable-next-line class-methods-use-this
  getGreeting() {
    return pickRandom(this.#greetings);
  }
}

module.exports = ElizaBot;
