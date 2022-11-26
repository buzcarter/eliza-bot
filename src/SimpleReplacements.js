/**
 * Performs simple 1:1 word replacements. Preload your instnaced in a simple "substitution
 * dictionary", name/value pairs. Note: due to simplicity the order of these definitions matter.
 *
 * Mostly this is to catch varieties in spelling, misspellings, contractions and the like.
 *
 * @example
 *
 * const dictionary = {
 *   cat: 'bird',
 *   treehouse: 'pineapple',
 * };
 *
 * const replacer = new SimpleReplacements(dictionary);
 * const newPhrase = replacer.doSubstitutions('My cat likes to sleep in my treehouse');
 * // result: "My bird likes to sleep in my pineapple"
 */
class SimpleReplacements {
  #wordSubs = {};

  #regEx = null;

  constructor(subsDict) {
    this.#wordSubs = subsDict;
    const values = Object.keys(subsDict);
    this.#regEx = new RegExp(`\\b(${values.join('|')})\\b`, 'g');
  }

  /**
   * @param {string} phrase
   * @returns {string}
   */
  doSubstitutions(phrase) {
    return `${phrase}`.replace(this.#regEx, (match) => this.#wordSubs[match]);
  }
}

module.exports = SimpleReplacements;
