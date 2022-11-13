/* eslint-disable key-spacing, no-multi-spaces */
const TestPresubstitutions = [
  'dont',         "don't",
  'wont',         "won't",
  'recall',       'remember',
  'dreamt',       'dreamed',
  'computers',    'thinking box',
  'equivalent',   'alike',
  'sister',       'aunt',
];

const elizaPres = require('./elizaPres');

describe('elizaPres', () => {
  beforeAll(() => {
    elizaPres.init(TestPresubstitutions);
  });

  describe('preprocess', () => {
    it('should correctly replace (Happy Path)', () => {
      const tests = [{
        source:         'my tall sister dont or wont recall her purple computers dreamt with ice cream equivalent pizza',
        expectedResult: 'my tall aunt don\'t or won\'t remember her purple thinking box dreamed with ice cream alike pizza',
      }];

      tests.forEach(({ source, expectedResult }) => {
        const result = elizaPres.preprocess(source);
        expect(result).toBe(expectedResult);
      });
    });
  });
});
