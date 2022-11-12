/**
 * # How memory is used
  * In the script, some reassembly rules are special. They are marked with the keyword ``reasm_for_memory'', rather than just ``reasm''. Eliza ``remembers'' any comment when it matches a docomposition rule for which there are any reassembly rules for memory. An Eliza object remembers up to $max_memory_size (default: 5) user input strings.
  *
  * If, during a subsequent run, the transform() method fails to find any appropriate decomposition rule for a user's comment, and if there are any comments inside the memory array, then Eliza may elect to ignore the most recent comment and instead pull out one of the strings from memory. In this case, the transform method is called recursively with the memory flag.
  *
  * Honestly, I am not sure exactly how this memory functionality was implemented in the original Eliza program. Hopefully this implementation is not too far from Weizenbaum's.
  *
  * If you don't want to use the memory functionality at all, then you can disable it:
  *
  *         $mybot->memory_on(0);
  * You can also achieve the same effect by making sure that the script data does not contain any reassembly rules marked with the keyword ``reasm_for_memory''. The default script data only has 4 such items.
 */
class ElizaMemory {
  constructor(opts) {
    const { noRandom } = opts || {};
    this.#noRandom = Boolean(noRandom);
    this.#memSize = 20; // TODO: make an option
    this.#mem = [];
  }

  /**
   * A list of user comments which an Eliza instance is remembering for future use.
   * Eliza does not remember everything, only some things.
   * In this implementation, Eliza will only remember comments which match a decomposition rule which actually has reassembly rules that are marked with the keyword ``reasm_for_memory'' rather than the normal ``reasmb''. The default script only has a few of these.
   */
  #mem = [];

  #memSize = 1;

  #noRandom = true;

  save(phrase) {
    this.#mem.push(phrase);
    if (this.#mem.length > this.#memSize) {
      this.#mem.shift();
    }
    console.log(`Adding response ${phrase}`);
  }

  get() {
    if (!this.#mem.length) {
      return '';
    }

    if (this.#noRandom) {
      return this.#mem.shift();
    }

    const index = Math.floor(Math.random() * this.#mem.length);
    const phrase = this.#mem[index];
    console.log(`using memory response ${phrase}`);
    for (let i = index + 1; i < this.#mem.length; i++) {
      this.#mem[i - 1] = this.#mem[i];
    }

    this.#mem.length--;
    return phrase;
  }

  reset() {
    this.#mem = [];
  }
}

module.exports = ElizaMemory;
