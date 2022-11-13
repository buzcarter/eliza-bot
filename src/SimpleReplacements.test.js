/* eslint-disable key-spacing, no-multi-spaces */
const Dictionary1 = {
  am:       'are',
  your:     'my',
  me:       'you',
  myself:   'yourself',
  yourself: 'myself',
  "i'm":    'you are',
  i:        'you',
  you:      'I',
  my:       'your',
};

const Dictionary2 = {
  dont:         "don't",
  wont:         "won't",
  recall:       'remember',
  dreamt:       'dreamed',
  computers:    'thinking box',
  equivalent:   'alike',
  sister:       'aunt',
  chickens: 'swans',
};
/* eslint-enable key-spacing, no-multi-spaces */

const SimpleReplacements = require('./SimpleReplacements');

describe('SimpleReplacements', () => {
  describe('doSubstitutions', () => {
    it('should correctly replace (Happy Path)', () => {
      const replacer = new SimpleReplacements(Dictionary1);
      const tests = [{
        source: 'you are my favorite that i\'m able and for i, myself this is not yourself',
        expectedResult: 'I are your favorite that you are able and for you, yourself this is not myself',
      }, {
        source: '',
        expectedResult: '',
      }];

      tests.forEach(({ source, expectedResult }) => {
        const result = replacer.doSubstitutions(source);
        expect(result).toBe(expectedResult);
      });
    });

    it('should handle multiple instances', () => {
      // eslint-disable-next-line no-unused-vars
      const replacer1 = new SimpleReplacements(Dictionary1);
      const replacer2 = new SimpleReplacements(Dictionary2);
      const tests = [{
        source: 'my tall sister, the one with the chickens, dont or wont recall her purple computers dreamt with ice cream equivalent pizza',
        expectedResult: 'my tall aunt, the one with the swans, don\'t or won\'t remember her purple thinking box dreamed with ice cream alike pizza',
      }];

      tests.forEach(({ source, expectedResult }) => {
        const result = replacer2.doSubstitutions(source);
        expect(result).toBe(expectedResult);
      });
    });
  });
});
