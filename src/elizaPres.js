const langConfig = require('./languageConfig');

/**
 * # preprocess()
 * `preprocess()` applies simple substitution rules to the input string.
 * Mostly this is to catch varieties in spelling, misspellings, contractions and the like.
 *
 * `preprocess()` is called from within the transform() method.
 * It is applied to user-input text, BEFORE any processing, and before a reassebly statement has been selected.
 *
 * It uses the array %pre, which is created during the parse of the script.
 *
 * @example
 *   userStmt = preprocess(userStmt);
 */
class ElizPres {
  pres = null;

  preExp = null;

  elizaPres = null;

  init() {
    this.elizaPres = langConfig.pres;
    this.pres = {};

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
  }

  preprocess(part) {
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
      // eslint-disable-next-line no-param-reassign
      part = lp + rp;
    }
    return part;
  }
}

module.exports = new ElizPres();
