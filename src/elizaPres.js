/**
 * # doSubstitutions()
 * `doSubstitutions()` applies simple substitution rules to the input string.
 * Mostly this is to catch varieties in spelling, misspellings, contractions and the like.
 *
 * `doSubstitutions()` is called from within the transform() method.
 * It is applied to user-input text, BEFORE any processing, and before a reassebly statement has been selected.
 *
 * It uses the array %pre, which is created during the parse of the script.
 *
 * @example
 *   userStmt = doSubstitutions(userStmt);
 */
class ElizPres {
  #wordSubs = {};

  #regEx = null;

  constructor(subsDict) {
    this.#wordSubs = subsDict;
    const values = Object.keys(subsDict);
    this.#regEx = new RegExp(`\\b(${values.join('|')})\\b`);
  }

  doSubstitutions(phrase) {
    if (!this.#regEx.test(phrase)) {
      return phrase;
    }

    let matches = this.#regEx.exec(phrase);
    let result = '';
    let remaining = phrase;
    while (matches) {
      result += remaining.substring(0, matches.index) + this.#wordSubs[matches[1]];
      remaining = remaining.substring(matches.index + matches[0].length);
      matches = this.#regEx.exec(remaining);
    }

    return result + remaining;
  }
}

module.exports = ElizPres;
