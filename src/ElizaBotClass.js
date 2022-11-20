const ElizaMemory = require('./elizaMemory');
const SimpleReplacements = require('./SimpleReplacements');
const langConfig = require('./languageConfig');
const { initCap, pickRandom } = require('./utils');

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

  synonymsHash = null;

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
    this.synonymsHash = langConfig.synonyms;

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
    // generate synonym list
    const synPatterns = {};

    if (this.synonymsHash && typeof this.synonymsHash === 'object') {
      // eslint-disable-next-line guard-for-in, no-restricted-syntax
      for (const i in this.synonymsHash) {
        synPatterns[i] = `(${i}|${this.synonymsHash[i].join('|')})`;
      }
    }

    // 1st convert rules to regexps

    const regExes = {
      /** finds "`@happy`" within "`* i am* @happy *`" */
      AT_VAR_NAMES: /@(\S+)/,
      /** Inline "*", finds "`u *r`" within "`* do you *remember *`" */
      INLINE_WILDCARD: /(\S)\s*\*\s*(\S)/,
      /** Starts with a wildcard, finds "`* a`" within "`* are you *`" */
      STARTS_WITH_WILDCARD: /^\s*\*\s*(\S)/,
      /** Ends with a wildcard, finds "`u *`" within "`* are you *`" */
      ENDS_WITH_WILDCARD: /(\S)\s*\*\s*$/,
      /** looks for "`*`" even if it's surrounded by spaces "`   *   `" */
      WILDCARD: /^\s*\*\s*$/,
      /** One or more spaces (anywhere) */
      WHITESPACE: /\s+/g,
    };

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

    // expand synonyms and insert asterisk expressions for backtracking
    this.keywordsList.forEach((keywordEntry, k) => {
      // eslint-disable-next-line no-param-reassign
      keywordEntry.originalIndex = k; // save original index for sorting
      keywordEntry.phrases.forEach((thisPhrase) => {
        let newRegExStr = thisPhrase.pattern;

        // check mem flag and store it as decomp's element 2
        if (newRegExStr.charAt(0) === '$') {
          let offset = 1;
          while (newRegExStr.charAt[offset] === ' ') offset++;
          newRegExStr = newRegExStr.substring(offset);
          // eslint-disable-next-line no-param-reassign
          thisPhrase.useMemFlag = true;
        } else {
          // eslint-disable-next-line no-param-reassign
          thisPhrase.useMemFlag = false;
        }

        // expand synonyms
        let atVarsMatches = regExes.AT_VAR_NAMES.exec(newRegExStr);
        while (atVarsMatches) {
          const synonTxt = synPatterns[atVarsMatches[1]] ? synPatterns[atVarsMatches[1]] : atVarsMatches[1];
          newRegExStr = newRegExStr.substring(0, atVarsMatches.index) + synonTxt + newRegExStr.substring(atVarsMatches.index + atVarsMatches[0].length);
          atVarsMatches = regExes.AT_VAR_NAMES.exec(newRegExStr);
        }

        // expand asterisk expressions
        if (regExes.WILDCARD.test(newRegExStr)) {
          newRegExStr = '\\s*(.*)\\s*';
        } else {
          let inlineMatches = regExes.INLINE_WILDCARD.exec(newRegExStr);
          if (inlineMatches) {
            let leftPart = '';
            let rightPart = newRegExStr;
            while (inlineMatches) {
              leftPart += rightPart.substring(0, inlineMatches.index + 1);
              if (inlineMatches[1] !== ')') leftPart += '\\b';
              leftPart += '\\s*(.*)\\s*';
              if ((inlineMatches[2] !== '(') && (inlineMatches[2] !== '\\')) leftPart += '\\b';
              leftPart += inlineMatches[2];
              rightPart = rightPart.substring(inlineMatches.index + inlineMatches[0].length);
              inlineMatches = regExes.INLINE_WILDCARD.exec(rightPart);
            }
            newRegExStr = leftPart + rightPart;
          }

          const startsMatches = regExes.STARTS_WITH_WILDCARD.exec(newRegExStr);
          if (startsMatches) {
            let patternTxt = '\\s*(.*)\\s*';
            if ((startsMatches[1] !== ')') && (startsMatches[1] !== '\\')) patternTxt += '\\b';
            newRegExStr = patternTxt + newRegExStr.substring(startsMatches.index - 1 + startsMatches[0].length);
          }

          const endsMatches = regExes.ENDS_WITH_WILDCARD.exec(newRegExStr);
          if (endsMatches) {
            let patternTxt = newRegExStr.substring(0, endsMatches.index + 1);
            if (endsMatches[1] !== '(') patternTxt += '\\b';
            newRegExStr = `${patternTxt}\\s*(.*)\\s*`;
          }
        }

        // expand white space
        newRegExStr = newRegExStr.replace(regExes.WHITESPACE, '\\s+');

        // eslint-disable-next-line no-param-reassign
        thisPhrase.regEx = newRegExStr;

        regExes.WHITESPACE.lastIndex = 0;
      });
    });

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

  getReply(inputText) {
    this.quit = false;

    // unify text string
    // eslint-disable-next-line no-param-reassign
    inputText = inputText
      .toLowerCase()
      .replace(/@#\$%\^&\*\(\)_\+=~`\{\[\}\]\|:;<>\/\\\t/g, ' ')
      .replace(/\s+-+\s+/g, '.')
      .replace(/\s*[,.?!;]+\s*/g, '.')
      .replace(/\s*\bbut\b\s*/g, '.')
      .replace(/\s{2,}/g, ' ');

    // split text in part sentences and loop through them
    const parts = inputText.split('.');
    let reply = '';
    for (let i = 0; i < parts.length; i++) {
      let part = parts[i];
      if (part === '') {
        // eslint-disable-next-line no-continue
        continue;
      }

      // check for quit expression
      if (langConfig.quitCommands.includes(part)) {
        this.quit = true;
        return this.getFarewell();
      }

      part = this.#elizaPres.doSubstitutions(part);
      this.sentence = part;
      // loop trough keywords
      for (let k = 0; k < this.keywordsList.length; k++) {
        const { keyword } = this.keywordsList[k];
        if (part.search(new RegExp(`\\b${keyword}\\b`, 'i')) >= 0) {
          reply = this.#execRule(k);
        }
        if (reply !== '') {
          return reply;
        }
      }
    }

    // nothing matched try mem
    reply = this.#elizaMemory.get();

    // if nothing in mem so try xnone
    if (reply === '') {
      this.sentence = ' ';
      const k = this.#getRuleIndexByKey('xnone');
      if (k >= 0) {
        reply = this.#execRule(k);
      }
    }

    // return reply or default string
    return reply || 'I am at a loss for words.';
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
   * @param {int} keywordIndex
   * @returns {string} statement
   */
  #execRule(keywordIndex) {
    const paramRegEx = /\(([0-9]+)\)/;
    const { keyword, phrases, weight } = this.keywordsList[keywordIndex];
    for (let phraseIndex = 0; phraseIndex < phrases.length; phraseIndex++) {
      const thisPhrase = phrases[phraseIndex];
      const m = this.sentence.match(thisPhrase.regEx);
      if (m !== null) {
        const { responses, useMemFlag } = thisPhrase;

        let reply = this.#getNextResponse(keywordIndex, phraseIndex, responses);
        if (this.#debugEnabled) {
          // eslint-disable-next-line no-console
          console.log(`execRule match:\n  key: ${keyword}\n  weight: ${weight}\n  pattern: ${thisPhrase.pattern}\n  regEx: ${thisPhrase.regEx}\n  reasmb: ${reply}\n  useMemFlag: ${useMemFlag}`);
        }

        if (reply.search('^goto ', 'i') === 0) {
          const gotoIndex = this.#getRuleIndexByKey(reply.substring(5));
          if (gotoIndex >= 0) {
            return this.#execRule(gotoIndex);
          }
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
