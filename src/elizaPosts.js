/**
 * # `doSubstitutions`()
 *
 * `doSubstitutions`() applies simple substitution rules to the reassembly rule. This is where all the ``I'''s and ``you'''s are exchanged.
 * `doSubstitutions`() is called from within the transform() function.
 *
 * It uses the array %post, created during the parse of the script.
 *
 * @example
 * sampleText = doSubstitutions(sampleText);
 */
class ElizaPosts {
  #wordSubs = null;

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

module.exports = ElizaPosts;
