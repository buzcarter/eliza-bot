const ElizaMemory = require('./elizaMemory');
const SimpleReplacements = require('./SimpleReplacements');
const langConfig = require('./languageConfig');

const pickRandom = (ary) => ((!ary) ? '' : ary[Math.floor(Math.random() * ary.length)]);

class ElizaBot {
  #dataParsed = null;

  /*
  capitalizeFirstLetter = null;
  debug = null;
  elizaKeywords = null;
  elizaPostTransforms = null;
  elizaSynons = null;
  getFinal = null;
  lastchoice = null;
  noRandom = null;
  quit = null;
  sentence = null;
  version = null;
  */

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
    this.elizaKeywords = langConfig.keywords;
    this.elizaPostTransforms = langConfig.postTransforms;
    this.elizaPosts = langConfig.post;
    this.elizaSynons = langConfig.synonyms;

    const { debugEnabled, noRandom } = opts || {};
    this.noRandom = Boolean(noRandom);
    this.capitalizeFirstLetter = true;
    this.debug = Boolean(debugEnabled);
    this.version = '1.1 (original)';

    this.elizeMem = new ElizaMemory(opts);
    this.#dataParsed = false;
    if (!this.#dataParsed) {
      this.#init();
      this.#dataParsed = true;
    }
    this.reset();
  }

  reset() {
    this.quit = false;
    this.elizeMem.reset();
    this.lastchoice = [];

    for (let k = 0; k < this.elizaKeywords.length; k++) {
      this.lastchoice[k] = [];
      const { phrases } = this.elizaKeywords[k];
      for (let i = 0; i < phrases.length; i++) this.lastchoice[k][i] = -1;
    }
  }

  #init() {
    // parse data and convert it from canonical form to internal use
    // prodoce synonym list
    const synPatterns = {};

    if ((this.elizaSynons) && (typeof this.elizaSynons === 'object')) {
      // eslint-disable-next-line guard-for-in, no-restricted-syntax
      for (const i in this.elizaSynons) synPatterns[i] = `(${i}|${this.elizaSynons[i].join('|')})`;
    }

    // check for keywords or install empty structure to prevent any errors
    if (!Array.isArray(this.elizaKeywords) || !this.elizaKeywords.length) {
      this.elizaKeywords = [{
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

    // expand synonyms and insert asterisk expressions for backtracking
    this.elizaKeywords.forEach((keywordEntry, k) => {
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
    this.elizaKeywords.sort(ElizaBot.#sortKeywords);

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

  static #sortKeywords(a, b) {
    if (a.weight > b.weight) return -1;
    if (a.weight < b.weight) return 1;

    if (a.originalIndex > b.originalIndex) return 1;
    if (a.originalIndex < b.originalIndex) return -1;

    return 0;
  }

  transform(text) {
    this.quit = false;

    // unify text string
    // eslint-disable-next-line no-param-reassign
    text = text
      .toLowerCase()
      .replace(/@#\$%\^&\*\(\)_\+=~`\{\[\}\]\|:;<>\/\\\t/g, ' ')
      .replace(/\s+-+\s+/g, '.')
      .replace(/\s*[,.?!;]+\s*/g, '.')
      .replace(/\s*\bbut\b\s*/g, '.')
      .replace(/\s{2,}/g, ' ');

    // split text in part sentences and loop through them
    const parts = text.split('.');
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
        return this.getFinal();
      }

      part = this.#elizaPres.doSubstitutions(part);
      this.sentence = part;
      // loop trough keywords
      for (let k = 0; k < this.elizaKeywords.length; k++) {
        const { keyword } = this.elizaKeywords[k];
        if (part.search(new RegExp(`\\b${keyword}\\b`, 'i')) >= 0) {
          reply = this.#execRule(k);
        }
        if (reply !== '') {
          return reply;
        }
      }
    }

    // nothing matched try mem
    reply = this.elizeMem.get();

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

  /**
   * @param {int} keywordIndex
   * @returns {string} statement
   */
  #execRule(keywordIndex) {
    const paramRegEx = /\(([0-9]+)\)/;
    const { keyword, phrases, weight } = this.elizaKeywords[keywordIndex];
    for (let i = 0; i < phrases.length; i++) {
      const thisPhrase = phrases[i];
      const m = this.sentence.match(thisPhrase.regEx);
      if (m !== null) {
        const { responses, useMemFlag } = thisPhrase;

        let responseIndex = this.noRandom ? 0 : Math.floor(Math.random() * responses.length);
        if ((this.noRandom && (this.lastchoice[keywordIndex][i] > responseIndex)) || (this.lastchoice[keywordIndex][i] === responseIndex)) {
          responseIndex = ++this.lastchoice[keywordIndex][i];
          if (responseIndex >= responses.length) {
            responseIndex = 0;
            this.lastchoice[keywordIndex][i] = -1;
          }
        } else {
          this.lastchoice[keywordIndex][i] = responseIndex;
        }

        let reply = responses[responseIndex];
        if (this.debug) {
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
          this.elizeMem.save(reply);
        } else {
          return reply;
        }
      }
    }
    return '';
  }

  /* eslint-disable no-param-reassign */
  #postTransform(s) {
    // final cleanings
    s = s.replace(/\s{2,}/g, ' ');
    s = s.replace(/\s+\./g, '.');
    if ((this.elizaPostTransforms) && (this.elizaPostTransforms.length)) {
      for (let i = 0; i < this.elizaPostTransforms.length; i += 2) {
        s = s.replace(this.elizaPostTransforms[i], this.elizaPostTransforms[i + 1]);
        this.elizaPostTransforms[i].lastIndex = 0;
      }
    }
    // capitalize first char
    if (this.capitalizeFirstLetter) {
      const re = /^([a-z])/;
      const m = re.exec(s);
      if (m) s = m[0].toUpperCase() + s.substring(1);
    }
    return s;
  }
  /* eslint-enable no-param-reassign */

  #getRuleIndexByKey(key) {
    for (let k = 0; k < this.elizaKeywords.length; k++) {
      const { keyword } = this.elizaKeywords[k];
      if (keyword === key) {
        return k;
      }
    }
    return -1;
  }

  // eslint-disable-next-line class-methods-use-this
  getFinal() {
    return pickRandom(langConfig.farewells);
  }

  // eslint-disable-next-line class-methods-use-this
  getInitial() {
    return pickRandom(langConfig.greetings);
  }
}

module.exports = ElizaBot;
