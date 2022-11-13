/* eslint-disable key-spacing, no-multi-spaces */
const TestPresubstitutions = {
  dont:         "don't",
  wont:         "won't",
  recall:       'remember',
  dreamt:       'dreamed',
  computers:    'thinking box',
  equivalent:   'alike',
  sister:       'aunt',
};

const ElizPres = require('./elizaPres');

describe('elizaPres', () => {
  let elizaPres;

  beforeAll(() => {
    elizaPres = new ElizPres(TestPresubstitutions);
  });

  describe('doSubstitutions', () => {
    it('should correctly replace (Happy Path)', () => {
      const tests = [{
        source:         'my tall sister dont or wont recall her purple computers dreamt with ice cream equivalent pizza',
        expectedResult: 'my tall aunt don\'t or won\'t remember her purple thinking box dreamed with ice cream alike pizza',
      }];

      tests.forEach(({ source, expectedResult }) => {
        const result = elizaPres.doSubstitutions(source);
        expect(result).toBe(expectedResult);
      });
    });
  });
});
