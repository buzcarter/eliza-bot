const regExMaker = require('./regExMaker');

describe('regExMaker', () => {
  describe('endsWithWildcard', () => {
    const { __test__: { endsWithWildcard } } = regExMaker;

    const Tests = [{
      value: '* do nothing',
      expectedResult: '* do nothing',
    }, {
      value: '* i remember *',
      expectedResult: '* i remember\\b\\s*(.*)\\s*',
    }, {
      value: '* do you remember *',
      expectedResult: '* do you remember\\b\\s*(.*)\\s*',
    }, {
      value: '* you remember *',
      expectedResult: '* you remember\\b\\s*(.*)\\s*',
    }, {
      value: '* i forget *',
      expectedResult: '* i forget\\b\\s*(.*)\\s*',
    }, {
      value: '* did you forget *',
      expectedResult: '* did you forget\\b\\s*(.*)\\s*',
    }, {
      value: '* if *',
      expectedResult: '* if\\b\\s*(.*)\\s*',
    }, {
      value: '* i dreamed *',
      expectedResult: '* i dreamed\\b\\s*(.*)\\s*',
    }, {
      value: '* am i *',
      expectedResult: '* am i\\b\\s*(.*)\\s*',
    }, {
      value: '* i am *',
      expectedResult: '* i am\\b\\s*(.*)\\s*',
    }, {
      value: '* are you *',
      expectedResult: '* are you\\b\\s*(.*)\\s*',
    }, {
      value: '* you are *',
      expectedResult: '* you are\\b\\s*(.*)\\s*',
    }, {
      value: '* are *',
      expectedResult: '* are\\b\\s*(.*)\\s*',
    }, {
      value: '* your *',
      expectedResult: '* your\\b\\s*(.*)\\s*',
    }, {
      value: '* was i *',
      expectedResult: '* was i\\b\\s*(.*)\\s*',
    }, {
      value: '* i was *',
      expectedResult: '* i was\\b\\s*(.*)\\s*',
    }, {
      value: '* was you *',
      expectedResult: '* was you\\b\\s*(.*)\\s*',
    }, {
      value: '* i (desire|want|need) *',
      expectedResult: '* i (desire|want|need)\\b\\s*(.*)\\s*',
    }, {
      value: '* i am\\b\\s*(.*)\\s*(sad|unhappy|depressed|sick) *',
      expectedResult: '* i am\\b\\s*(.*)\\s*(sad|unhappy|depressed|sick)\\b\\s*(.*)\\s*',
    }, {
      value: '* i am\\b\\s*(.*)\\s*(happy|elated|glad|better) *',
      expectedResult: '* i am\\b\\s*(.*)\\s*(happy|elated|glad|better)\\b\\s*(.*)\\s*',
    }, {
      value: '* i was *',
      expectedResult: '* i was\\b\\s*(.*)\\s*',
    }, {
      value: '* i (belief|feel|think|believe|wish) i *',
      expectedResult: '* i (belief|feel|think|believe|wish) i\\b\\s*(.*)\\s*',
    }, {
      value: '* i\\b\\s*(.*)\\s*(belief|feel|think|believe|wish)\\s*(.*)\\s*\\byou *',
      expectedResult: '* i\\b\\s*(.*)\\s*(belief|feel|think|believe|wish)\\s*(.*)\\s*\\byou\\b\\s*(.*)\\s*',
    }, {
      value: '* i am *',
      expectedResult: '* i am\\b\\s*(.*)\\s*',
    }, {
      value: "\\s*(.*)\\s*\\bi (cannot|can't) *",
      expectedResult: "\\s*(.*)\\s*\\bi (cannot|can't)\\b\\s*(.*)\\s*",
    }, {
      value: "\\s*(.*)\\s*\\bi don't *",
      expectedResult: "\\s*(.*)\\s*\\bi don't\\b\\s*(.*)\\s*",
    }, {
      value: '* i feel *',
      expectedResult: '* i feel\\b\\s*(.*)\\s*',
    }, {
      value: '* i\\b\\s*(.*)\\s*\\byou *',
      expectedResult: '* i\\b\\s*(.*)\\s*\\byou\\b\\s*(.*)\\s*',
    }, {
      value: '* you remind me of *',
      expectedResult: '* you remind me of\\b\\s*(.*)\\s*',
    }, {
      value: '* you are *',
      expectedResult: '* you are\\b\\s*(.*)\\s*',
    }, {
      value: '* you\\b\\s*(.*)\\s*\\bme *',
      expectedResult: '* you\\b\\s*(.*)\\s*\\bme\\b\\s*(.*)\\s*',
    }, {
      value: '* you *',
      expectedResult: '* you\\b\\s*(.*)\\s*',
    }, {
      value: '* no one *',
      expectedResult: '* no one\\b\\s*(.*)\\s*',
    }, {
      value: '* my *',
      expectedResult: '* my\\b\\s*(.*)\\s*',
    }, {
      value: '* my\\b\\s*(.*)\\s*(family|mother|mom|father|dad|sister|brother|wife|children|child|uncle|aunt|child) *',
      expectedResult: '* my\\b\\s*(.*)\\s*(family|mother|mom|father|dad|sister|brother|wife|children|child|uncle|aunt|child)\\b\\s*(.*)\\s*',
    }, {
      value: '* my *',
      expectedResult: '* my\\b\\s*(.*)\\s*',
    }, {
      value: '* can you *',
      expectedResult: '* can you\\b\\s*(.*)\\s*',
    }, {
      value: '* can i *',
      expectedResult: '* can i\\b\\s*(.*)\\s*',
    }, {
      value: 'who *',
      expectedResult: 'who\\b\\s*(.*)\\s*',
    }, {
      value: 'when *',
      expectedResult: 'when\\b\\s*(.*)\\s*',
    }, {
      value: 'where *',
      expectedResult: 'where\\b\\s*(.*)\\s*',
    }, {
      value: 'how *',
      expectedResult: 'how\\b\\s*(.*)\\s*',
    }, {
      value: "* why don't you *",
      expectedResult: "* why don't you\\b\\s*(.*)\\s*",
    }, {
      value: "* why can't i *",
      expectedResult: "* why can't i\\b\\s*(.*)\\s*",
    }, {
      value: '* (everyone|everybody|nobody|noone) *',
      expectedResult: '* (everyone|everybody|nobody|noone)\\b\\s*(.*)\\s*',
    }, {
      value: '* (be|am|is|are|was)\\s*(.*)\\s*\\blike *',
      expectedResult: '* (be|am|is|are|was)\\s*(.*)\\s*\\blike\\b\\s*(.*)\\s*',
    }];

    Tests.forEach(({ value, expectedResult }, index) => {
      it(`should pass test ${index}`, () => {
        const result = endsWithWildcard(value);
        expect(result).toBe(expectedResult);
      });
    });
  });
});
