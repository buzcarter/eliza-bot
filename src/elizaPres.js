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
    this.#regEx = new RegExp(`\\b(${values.join('|')})\\b`, 'g');
  }

  doSubstitutions(phrase) {
    return `${phrase}`.replace(this.#regEx, (match) => this.#wordSubs[match]);
  }
}

module.exports = ElizPres;
