/* eslint-disable no-underscore-dangle */
const languageConfig = require('./languageConfig');

class ElizaBot {
  /*
  _dataParsed = null;
  capitalizeFirstLetter = null;
  debug = null;
  elizaFinals = null;
  elizaInitials = null;
  elizaKeywords = null;
  elizaPosts = null;
  elizaPostTransforms = null;
  elizaPres = null;
  elizaQuits = null;
  elizaSynons = null;
  getFinal = null;
  lastchoice = null;
  mem = null;
  memSize = null;
  noRandom = null;
  postExp = null;
  posts = null;
  preExp = null;
  pres = null;
  quit = null;
  sentence = null;
  version = null;
  */

  constructor(noRandomFlag) {
    this.elizaInitials = languageConfig.initials;
    this.elizaKeywords = languageConfig.keywords;
    this.elizaPostTransforms = languageConfig.postTransforms;
    this.elizaFinals = languageConfig.finals;
    this.elizaQuits = languageConfig.quits;
    this.elizaPres = languageConfig.pres;
    this.elizaPosts = languageConfig.post;
    this.elizaSynons = languageConfig.synonyms;

    this.noRandom = !!(noRandomFlag);
    this.capitalizeFirstLetter = true;
    this.debug = false;
    this.memSize = 20;
    this.version = '1.1 (original)';

    this._dataParsed = false;
    if (!this._dataParsed) {
      this._init();
      this._dataParsed = true;
    }
    this.reset();
  }

  reset() {
    this.quit = false;
    this.mem = [];
    this.lastchoice = [];

    for (let k = 0; k < this.elizaKeywords.length; k++) {
      this.lastchoice[k] = [];
      const rules = this.elizaKeywords[k][2];
      for (let i = 0; i < rules.length; i++) this.lastchoice[k][i] = -1;
    }
  }

  _init() {
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
    // expand synonyms and insert asterisk expressions for backtracking
    const sre = /@(\S+)/;
    const are = /(\S)\s*\*\s*(\S)/;
    const are1 = /^\s*\*\s*(\S)/;
    const are2 = /(\S)\s*\*\s*$/;
    const are3 = /^\s*\*\s*$/;
    const wsre = /\s+/g;
    for (let k = 0; k < this.elizaKeywords.length; k++) {
      const rules = this.elizaKeywords[k][2];
      this.elizaKeywords[k][3] = k; // save original index for sorting
      for (let i = 0; i < rules.length; i++) {
        const r = rules[i];
        // check mem flag and store it as decomp's element 2
        if (r[0].charAt(0) === '$') {
          let ofs = 1;
          while (r[0].charAt[ofs] === ' ') ofs++;
          r[0] = r[0].substring(ofs);
          r[2] = true;
        } else {
          r[2] = false;
        }
        // expand synonyms (v.1.1: work around lambda function)
        let m = sre.exec(r[0]);
        while (m) {
          const sp = (synPatterns[m[1]]) ? synPatterns[m[1]] : m[1];
          r[0] = r[0].substring(0, m.index) + sp + r[0].substring(m.index + m[0].length);
          m = sre.exec(r[0]);
        }
        // expand asterisk expressions (v.1.1: work around lambda function)
        if (are3.test(r[0])) {
          r[0] = '\\s*(.*)\\s*';
        } else {
          m = are.exec(r[0]);
          if (m) {
            let lp = '';
            let rp = r[0];
            while (m) {
              lp += rp.substring(0, m.index + 1);
              if (m[1] !== ')') lp += '\\b';
              lp += '\\s*(.*)\\s*';
              if ((m[2] !== '(') && (m[2] !== '\\')) lp += '\\b';
              lp += m[2];
              rp = rp.substring(m.index + m[0].length);
              m = are.exec(rp);
            }
            r[0] = lp + rp;
          }
          m = are1.exec(r[0]);
          if (m) {
            let lp = '\\s*(.*)\\s*';
            if ((m[1] !== ')') && (m[1] !== '\\')) lp += '\\b';
            r[0] = lp + r[0].substring(m.index - 1 + m[0].length);
          }
          m = are2.exec(r[0]);
          if (m) {
            let lp = r[0].substring(0, m.index + 1);
            if (m[1] !== '(') lp += '\\b';
            r[0] = `${lp}\\s*(.*)\\s*`;
          }
        }
        // expand white space
        r[0] = r[0].replace(wsre, '\\s+');
        wsre.lastIndex = 0;
      }
    }
    // now sort keywords by rank (highest first)
    this.elizaKeywords.sort(this._sortKeywords);
    // and compose regexps and refs for pres and posts
    this.pres = {};
    this.posts = {};

    if ((this.elizaPres) && (this.elizaPres.length)) {
      const a = [];
      for (let i = 0; i < this.elizaPres.length; i += 2) {
        a.push(this.elizaPres[i]);
        this.pres[this.elizaPres[i]] = this.elizaPres[i + 1];
      }
      this.preExp = new RegExp(`\\b(${a.join('|')})\\b`);
    } else {
      // default (should not match)
      this.preExp = /####/;
      this.pres['####'] = '####';
    }

    if ((this.elizaPosts) && (this.elizaPosts.length)) {
      const a = [];
      for (let i = 0; i < this.elizaPosts.length; i += 2) {
        a.push(this.elizaPosts[i]);
        this.posts[this.elizaPosts[i]] = this.elizaPosts[i + 1];
      }
      this.postExp = new RegExp(`\\b(${a.join('|')})\\b`);
    } else {
      // default (should not match)
      this.postExp = /####/;
      this.posts['####'] = '####';
    }
    // check for elizaQuits and install default if missing
    if ((!this.elizaQuits) || (typeof this.elizaQuits.length === 'undefined')) {
      this.elizaQuits = [];
    }
    // done
    this._dataParsed = true;
  }

  // eslint-disable-next-line class-methods-use-this
  _sortKeywords(a, b) {
    // sort by rank
    if (a[1] > b[1]) return -1;
    if (a[1] < b[1]) return 1;
    // or original index
    if (a[3] > b[3]) return 1;
    if (a[3] < b[3]) return -1;
    return 0;
  }

  transform(text) {
    let rpl = '';
    this.quit = false;

    /* eslint-disable no-param-reassign */
    // unify text string
    text = text.toLowerCase();
    text = text.replace(/@#\$%\^&\*\(\)_\+=~`\{\[\}\]\|:;<>\/\\\t/g, ' ');
    text = text.replace(/\s+-+\s+/g, '.');
    text = text.replace(/\s*[,.?!;]+\s*/g, '.');
    text = text.replace(/\s*\bbut\b\s*/g, '.');
    text = text.replace(/\s{2,}/g, ' ');
    /* eslint-enable no-param-reassign */

    // split text in part sentences and loop through them
    const parts = text.split('.');
    for (let i = 0; i < parts.length; i++) {
      let part = parts[i];
      if (part !== '') {
        // check for quit expression
        for (let q = 0; q < this.elizaQuits.length; q++) {
          if (this.elizaQuits[q] === part) {
            this.quit = true;
            return this.getFinal();
          }
        }
        // preprocess (v.1.1: work around lambda function)
        let m = this.preExp.exec(part);
        if (m) {
          let lp = '';
          let rp = part;
          while (m) {
            lp += rp.substring(0, m.index) + this.pres[m[1]];
            rp = rp.substring(m.index + m[0].length);
            m = this.preExp.exec(rp);
          }
          part = lp + rp;
        }
        this.sentence = part;
        // loop trough keywords
        for (let k = 0; k < this.elizaKeywords.length; k++) {
          if (part.search(new RegExp(`\\b${this.elizaKeywords[k][0]}\\b`, 'i')) >= 0) {
            rpl = this._execRule(k);
          }
          if (rpl !== '') return rpl;
        }
      }
    }
    // nothing matched try mem
    rpl = this._memGet();
    // if nothing in mem, so try xnone
    if (rpl === '') {
      this.sentence = ' ';
      const k = this._getRuleIndexByKey('xnone');
      if (k >= 0) rpl = this._execRule(k);
    }
    // return reply or default string
    return (rpl !== '') ? rpl : 'I am at a loss for words.';
  }

  _execRule(k) {
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
          // eslint-disable-next-line no-alert
          alert(`match:\nkey: ${this.elizaKeywords[k][0]
          }\nrank: ${this.elizaKeywords[k][1]
          }\ndecomp: ${decomps[i][0]
          }\nreasmb: ${rpl
          }\nmemflag: ${memflag}`);
        }
        if (rpl.search('^goto ', 'i') === 0) {
          const ki = this._getRuleIndexByKey(rpl.substring(5));
          if (ki >= 0) return this._execRule(ki);
        }
        // substitute positional params (v.1.1: work around lambda function)
        let m1 = paramre.exec(rpl);
        if (m1) {
          let lp = '';
          let rp = rpl;
          while (m1) {
            let param = m[parseInt(m1[1], 10)];
            // postprocess param
            let m2 = this.postExp.exec(param);
            if (m2) {
              let lp2 = '';
              let rp2 = param;
              while (m2) {
                lp2 += rp2.substring(0, m2.index) + this.posts[m2[1]];
                rp2 = rp2.substring(m2.index + m2[0].length);
                m2 = this.postExp.exec(rp2);
              }
              param = lp2 + rp2;
            }
            lp += rp.substring(0, m1.index) + param;
            rp = rp.substring(m1.index + m1[0].length);
            m1 = paramre.exec(rp);
          }
          rpl = lp + rp;
        }
        rpl = this._postTransform(rpl);
        if (memflag) this._memSave(rpl);
        else return rpl;
      }
    }
    return '';
  }

  /* eslint-disable no-param-reassign */
  _postTransform(s) {
    // final cleanings
    s = s.replace(/\s{2,}/g, ' ');
    s = s.replace(/\s+\./g, '.');
    if ((this.elizaPostTransforms) && (this.elizaPostTransforms.length)) {
      for (let i = 0; i < this.elizaPostTransforms.length; i += 2) {
        s = s.replace(this.elizaPostTransforms[i], this.elizaPostTransforms[i + 1]);
        this.elizaPostTransforms[i].lastIndex = 0;
      }
    }
    // capitalize first char (v.1.1: work around lambda function)
    if (this.capitalizeFirstLetter) {
      const re = /^([a-z])/;
      const m = re.exec(s);
      if (m) s = m[0].toUpperCase() + s.substring(1);
    }
    return s;
  }
  /* eslint-enable no-param-reassign */

  _getRuleIndexByKey(key) {
    for (let k = 0; k < this.elizaKeywords.length; k++) {
      if (this.elizaKeywords[k][0] === key) return k;
    }
    return -1;
  }

  _memSave(t) {
    this.mem.push(t);
    if (this.mem.length > this.memSize) this.mem.shift();
  }

  _memGet() {
    if (this.mem.length) {
      if (this.noRandom) return this.mem.shift();

      const n = Math.floor(Math.random() * this.mem.length);
      const rpl = this.mem[n];
      for (let i = n + 1; i < this.mem.length; i++) this.mem[i - 1] = this.mem[i];
      this.mem.length--;
      return rpl;
    } return '';
  }

  getFinal() {
    if (!this.elizaFinals) return '';
    return this.elizaFinals[Math.floor(Math.random() * this.elizaFinals.length)];
  }

  getInitial() {
    if (!this.elizaInitials) return '';
    return this.elizaInitials[Math.floor(Math.random() * this.elizaInitials.length)];
  }
}

module.exports = ElizaBot;