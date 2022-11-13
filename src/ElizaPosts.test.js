/* eslint-disable key-spacing, no-multi-spaces */
const TestPresubstitutions = [
  'am',       'are',
  'your',     'my',
  'me',       'you',
  'myself',   'yourself',
  'yourself', 'myself',
  "i'm",      'you are',
  'i',        'you',
  'you',      'I',
  'my',       'your',
];

const ElizaPosts = require('./elizaPosts');

describe('elizaPosts', () => {
  let elizaPosts;

  beforeAll(() => {
    elizaPosts = new ElizaPosts(TestPresubstitutions);
  });

  describe('doSubstitutions', () => {
    it('should correctly replace (Happy Path)', () => {
      const tests = [{
        source:         'you are my favorite that i\'m able and for i, myself this is not yourself',
        expectedResult: 'I are your favorite that you are able and for you, yourself this is not myself',
      }];

      tests.forEach(({ source, expectedResult }) => {
        const result = elizaPosts.doSubstitutions(source);
        expect(result).toBe(expectedResult);
      });
    });
  });
});
