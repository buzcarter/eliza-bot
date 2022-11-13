/**
 * # `postprocess`()
 *
 * `postprocess`() applies simple substitution rules to the reassembly rule. This is where all the ``I'''s and ``you'''s are exchanged.
 * `postprocess`() is called from within the transform() function.
 *
 * It uses the array %post, created during the parse of the script.
 *
 * @example
 * sampleText = postprocess(sampleText);
 */
class ElizaPosts {
  elizaPosts = null;

  postExp = null;

  posts = null;

  constructor(values) {
    this.posts = {};

    if (values && (values.length)) {
      const a = [];
      for (let i = 0; i < values.length; i += 2) {
        a.push(values[i]);
        this.posts[values[i]] = values[i + 1];
      }
      this.postExp = new RegExp(`\\b(${a.join('|')})\\b`);
    } else {
      // default (should not match)
      this.postExp = /####/;
      this.posts['####'] = '####';
    }
  }

  doSubstitutions(param) {
    // postprocess param
    let m2 = this.postExp.exec(param);
    if (!m2) {
      return param;
    }
    let lp2 = '';
    let rp2 = param;
    while (m2) {
      lp2 += rp2.substring(0, m2.index) + this.posts[m2[1]];
      rp2 = rp2.substring(m2.index + m2[0].length);
      m2 = this.postExp.exec(rp2);
    }
    return lp2 + rp2;
  }
}

module.exports = ElizaPosts;
