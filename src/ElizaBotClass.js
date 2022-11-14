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
      const rules = this.elizaKeywords[k][2];
      for (let i = 0; i < rules.length; i++) this.lastchoice[k][i] = -1;
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
    if ((!this.elizaKeywords) || (typeof this.elizaKeywords.length === 'undefined')) {
      this.elizaKeywords = [
        ['###', 0, [
          ['###', []],
        ]],
      ];
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
    for (let k = 0; k < this.elizaKeywords.length; k++) {
      const rulesList = this.elizaKeywords[k][2];
      this.elizaKeywords[k][3] = k; // save original index for sorting
      for (let i = 0; i < rulesList.length; i++) {
        const rule = rulesList[i];
        let rulePattern = rule[0];

        // check mem flag and store it as decomp's element 2
        if (rulePattern.charAt(0) === '$') {
          let offset = 1;
          while (rulePattern.charAt[offset] === ' ') offset++;
          rulePattern = rulePattern.substring(offset);
          rule[2] = true;
        } else {
          rule[2] = false;
        }

        // expand synonyms
        let atVarsMatches = regExes.AT_VAR_NAMES.exec(rulePattern);
        while (atVarsMatches) {
          const synonTxt = synPatterns[atVarsMatches[1]] ? synPatterns[atVarsMatches[1]] : atVarsMatches[1];
          rulePattern = rulePattern.substring(0, atVarsMatches.index) + synonTxt + rulePattern.substring(atVarsMatches.index + atVarsMatches[0].length);
          atVarsMatches = regExes.AT_VAR_NAMES.exec(rulePattern);
        }

        // expand asterisk expressions
        if (regExes.WILDCARD.test(rulePattern)) {
          rulePattern = '\\s*(.*)\\s*';
        } else {
          let inlineMatches = regExes.INLINE_WILDCARD.exec(rulePattern);
          if (inlineMatches) {
            let leftPart = '';
            let rightPart = rulePattern;
            while (inlineMatches) {
              leftPart += rightPart.substring(0, inlineMatches.index + 1);
              if (inlineMatches[1] !== ')') leftPart += '\\b';
              leftPart += '\\s*(.*)\\s*';
              if ((inlineMatches[2] !== '(') && (inlineMatches[2] !== '\\')) leftPart += '\\b';
              leftPart += inlineMatches[2];
              rightPart = rightPart.substring(inlineMatches.index + inlineMatches[0].length);
              inlineMatches = regExes.INLINE_WILDCARD.exec(rightPart);
            }
            rulePattern = leftPart + rightPart;
          }

          const startsMatches = regExes.STARTS_WITH_WILDCARD.exec(rulePattern);
          if (startsMatches) {
            let patternTxt = '\\s*(.*)\\s*';
            if ((startsMatches[1] !== ')') && (startsMatches[1] !== '\\')) patternTxt += '\\b';
            rulePattern = patternTxt + rulePattern.substring(startsMatches.index - 1 + startsMatches[0].length);
          }

          const endsMatches = regExes.ENDS_WITH_WILDCARD.exec(rulePattern);
          if (endsMatches) {
            let patternTxt = rulePattern.substring(0, endsMatches.index + 1);
            if (endsMatches[1] !== '(') patternTxt += '\\b';
            rulePattern = `${patternTxt}\\s*(.*)\\s*`;
          }
        }

        // expand white space
        rulePattern = rulePattern.replace(regExes.WHITESPACE, '\\s+');

        rule[0] = rulePattern;

        regExes.WHITESPACE.lastIndex = 0;
      }
    }

    // now sort keywords by rank (highest first)
    this.elizaKeywords.sort(this.#sortKeywords);

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

  // eslint-disable-next-line class-methods-use-this
  #sortKeywords(a, b) {
    // sort by rank
    if (a[1] > b[1]) return -1;
    if (a[1] < b[1]) return 1;
    // or original index
    if (a[3] > b[3]) return 1;
    if (a[3] < b[3]) return -1;
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
        if (part.search(new RegExp(`\\b${this.elizaKeywords[k][0]}\\b`, 'i')) >= 0) {
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

  #execRule(k) {
    const rule = this.elizaKeywords[k];
    const decomps = rule[2];
    const paramre = /\(([0-9]+)\)/;
    for (let i = 0; i < decomps.length; i++) {
      const m = this.sentence.match(decomps[i][0]);
      if (m !== null) {
        const reasmbs = decomps[i][1];
        const memflag = decomps[i][2];
        let ri = (this.noRandom) ? 0 : Math.floor(Math.random() * reasmbs.length);
        if (((this.noRandom) && (this.lastchoice[k][i] > ri)) || (this.lastchoice[k][i] === ri)) {
          ri = ++this.lastchoice[k][i];
          if (ri >= reasmbs.length) {
            ri = 0;
            this.lastchoice[k][i] = -1;
          }
        } else {
          this.lastchoice[k][i] = ri;
        }
        let rpl = reasmbs[ri];
        if (this.debug) {
          // eslint-disable-next-line no-console
          console.log(`match:\nkey: ${this.elizaKeywords[k][0]}\nrank: ${this.elizaKeywords[k][1]}\ndecomp: ${decomps[i][0]}\nreasmb: ${rpl}\nmemflag: ${memflag}`);
        }
        if (rpl.search('^goto ', 'i') === 0) {
          const ki = this.#getRuleIndexByKey(rpl.substring(5));
          if (ki >= 0) return this.#execRule(ki);
        }
        // substitute positional params
        let m1 = paramre.exec(rpl);
        if (m1) {
          let lp = '';
          let rp = rpl;
          while (m1) {
            let param = m[parseInt(m1[1], 10)];
            param = this.#elizaPosts.doSubstitutions(param);
            lp += rp.substring(0, m1.index) + param;
            rp = rp.substring(m1.index + m1[0].length);
            m1 = paramre.exec(rp);
          }
          rpl = lp + rp;
        }
        rpl = this.#postTransform(rpl);
        if (memflag) this.elizeMem.save(rpl);
        else return rpl;
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
      if (this.elizaKeywords[k][0] === key) return k;
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
