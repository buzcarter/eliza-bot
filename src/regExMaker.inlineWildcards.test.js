const regExMaker = require('./regExMaker');

describe('regExMaker', () => {
  describe('inlineWildcards', () => {
    const { __test__: { inlineWildcards } } = regExMaker;

    const Tests = [{
      value: '* i remember *',
      expectedResult: '* i remember *',
    }, {
      value: '* do you remember *',
      expectedResult: '* do you remember *',
    }, {
      value: '* you remember *',
      expectedResult: '* you remember *',
    }, {
      value: '* i forget *',
      expectedResult: '* i forget *',
    }, {
      value: '* did you forget *',
      expectedResult: '* did you forget *',
    }, {
      value: '* if *',
      expectedResult: '* if *',
    }, {
      value: '* i dreamed *',
      expectedResult: '* i dreamed *',
    }, {
      value: '* am i *',
      expectedResult: '* am i *',
    }, {
      value: '* i am *',
      expectedResult: '* i am *',
    }, {
      value: '* are you *',
      expectedResult: '* are you *',
    }, {
      value: '* you are *',
      expectedResult: '* you are *',
    }, {
      value: '* are *',
      expectedResult: '* are *',
    }, {
      value: '* your *',
      expectedResult: '* your *',
    }, {
      value: '* was i *',
      expectedResult: '* was i *',
    }, {
      value: '* i was *',
      expectedResult: '* i was *',
    }, {
      value: '* was you *',
      expectedResult: '* was you *',
    }, {
      value: '* i (desire|want|need) *',
      expectedResult: '* i (desire|want|need) *',
    }, {
      value: '* i am* (sad|unhappy|depressed|sick) *',
      expectedResult: '* i am\\b\\s*(.*)\\s*(sad|unhappy|depressed|sick) *',
    }, {
      value: '* i am* (happy|elated|glad|better) *',
      expectedResult: '* i am\\b\\s*(.*)\\s*(happy|elated|glad|better) *',
    }, {
      value: '* i was *',
      expectedResult: '* i was *',
    }, {
      value: '* i (belief|feel|think|believe|wish) i *',
      expectedResult: '* i (belief|feel|think|believe|wish) i *',
    }, {
      value: '* i* (belief|feel|think|believe|wish) *you *',
      expectedResult: '* i\\b\\s*(.*)\\s*(belief|feel|think|believe|wish)\\s*(.*)\\s*\\byou *',
    }, {
      value: '* i am *',
      expectedResult: '* i am *',
    }, {
      value: "* i (cannot|can't) *",
      expectedResult: "* i (cannot|can't) *",
    }, {
      value: "* i don't *",
      expectedResult: "* i don't *",
    }, {
      value: '* i feel *',
      expectedResult: '* i feel *',
    }, {
      value: '* i * you *',
      expectedResult: '* i\\b\\s*(.*)\\s*\\byou *',
    }, {
      value: '* you remind me of *',
      expectedResult: '* you remind me of *',
    }, {
      value: '* you are *',
      expectedResult: '* you are *',
    }, {
      value: '* you* me *',
      expectedResult: '* you\\b\\s*(.*)\\s*\\bme *',
    }, {
      value: '* you *',
      expectedResult: '* you *',
    }, {
      value: '* no one *',
      expectedResult: '* no one *',
    }, {
      value: '* my *',
      expectedResult: '* my *',
    }, {
      value: '* my* (family|mother|mom|father|dad|sister|brother|wife|children|child|uncle|aunt|child) *',
      expectedResult: '* my\\b\\s*(.*)\\s*(family|mother|mom|father|dad|sister|brother|wife|children|child|uncle|aunt|child) *',
    }, {
      value: '* my *',
      expectedResult: '* my *',
    }, {
      value: '* can you *',
      expectedResult: '* can you *',
    }, {
      value: '* can i *',
      expectedResult: '* can i *',
    }, {
      value: 'who *',
      expectedResult: 'who *',
    }, {
      value: 'when *',
      expectedResult: 'when *',
    }, {
      value: 'where *',
      expectedResult: 'where *',
    }, {
      value: 'how *',
      expectedResult: 'how *',
    }, {
      value: "* why don't you *",
      expectedResult: "* why don't you *",
    }, {
      value: "* why can't i *",
      expectedResult: "* why can't i *",
    }, {
      value: '* (everyone|everybody|nobody|noone) *',
      expectedResult: '* (everyone|everybody|nobody|noone) *',
    }, {
      value: '* (be|am|is|are|was) *like *',
      expectedResult: '* (be|am|is|are|was)\\s*(.*)\\s*\\blike *',
    }];

    Tests.forEach(({ value, expectedResult }, index) => {
      it(`should pass test ${index}`, () => {
        const result = inlineWildcards(value);
        expect(result).toBe(expectedResult);
      });
    });
  });
});
