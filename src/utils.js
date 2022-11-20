/** capitalizes first character of `text` (sentence) */
const initCap = (text) => text.replace(/^([a-z])/, (char) => char.toUpperCase());

/** returns a random array entry */
const pickRandom = (ary) => ((!ary) ? '' : ary[Math.floor(Math.random() * ary.length)]);

module.exports = {
  initCap,
  pickRandom,
};
