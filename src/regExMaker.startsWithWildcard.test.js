const regExMaker = require('./regExMaker');

describe('regExMaker', () => {
  describe('startsWithWildcard', () => {
    const { __test__: { startsWithWildcard } } = regExMaker;

    const Tests = [{
      value: '* i remember *',
      expectedResult: '\\s*(.*)\\s*\\bi remember *',
    }, {
      value: '* do you remember *',
      expectedResult: '\\s*(.*)\\s*\\bdo you remember *',
    }, {
      value: '* you remember *',
      expectedResult: '\\s*(.*)\\s*\\byou remember *',
    }, {
      value: '* i forget *',
      expectedResult: '\\s*(.*)\\s*\\bi forget *',
    }, {
      value: '* did you forget *',
      expectedResult: '\\s*(.*)\\s*\\bdid you forget *',
    }, {
      value: '* if *',
      expectedResult: '\\s*(.*)\\s*\\bif *',
    }, {
      value: '* i dreamed *',
      expectedResult: '\\s*(.*)\\s*\\bi dreamed *',
    }, {
      value: '* am i *',
      expectedResult: '\\s*(.*)\\s*\\bam i *',
    }, {
      value: '* i am *',
      expectedResult: '\\s*(.*)\\s*\\bi am *',
    }, {
      value: '* are you *',
      expectedResult: '\\s*(.*)\\s*\\bare you *',
    }, {
      value: '* you are *',
      expectedResult: '\\s*(.*)\\s*\\byou are *',
    }, {
      value: '* are *',
      expectedResult: '\\s*(.*)\\s*\\bare *',
    }, {
      value: '* your *',
      expectedResult: '\\s*(.*)\\s*\\byour *',
    }, {
      value: '* was i *',
      expectedResult: '\\s*(.*)\\s*\\bwas i *',
    }, {
      value: '* i was *',
      expectedResult: '\\s*(.*)\\s*\\bi was *',
    }, {
      value: '* was you *',
      expectedResult: '\\s*(.*)\\s*\\bwas you *',
    }, {
      value: '* i (desire|want|need) *',
      expectedResult: '\\s*(.*)\\s*\\bi (desire|want|need) *',
    }, {
      value: '* i am tickled pink *',
      expectedResult: '\\s*(.*)\\s*\\bi am tickled pink *',
    }, {
      value: '* i am\\b\\s*(.*)\\s*(happy|elated|glad|better) *',
      expectedResult: '\\s*(.*)\\s*\\bi am\\b\\s*(.*)\\s*(happy|elated|glad|better) *',
    }, {
      value: '* i was *',
      expectedResult: '\\s*(.*)\\s*\\bi was *',
    }, {
      value: '* i (belief|feel|think|believe|wish) i *',
      expectedResult: '\\s*(.*)\\s*\\bi (belief|feel|think|believe|wish) i *',
    }, {
      value: '* i\\b\\s*(.*)\\s*(belief|feel|think|believe|wish)\\s*(.*)\\s*\\byou *',
      expectedResult: '\\s*(.*)\\s*\\bi\\b\\s*(.*)\\s*(belief|feel|think|believe|wish)\\s*(.*)\\s*\\byou *',
    }, {
      value: '* i am *',
      expectedResult: '\\s*(.*)\\s*\\bi am *',
    }, {
      value: "* i (cannot|can't) *",
      expectedResult: "\\s*(.*)\\s*\\bi (cannot|can't) *",
    }, {
      value: "* i don't *",
      expectedResult: "\\s*(.*)\\s*\\bi don't *",
    }, {
      value: '* i feel *',
      expectedResult: '\\s*(.*)\\s*\\bi feel *',
    }, {
      value: '* i\\b\\s*(.*)\\s*\\byou *',
      expectedResult: '\\s*(.*)\\s*\\bi\\b\\s*(.*)\\s*\\byou *',
    }, {
      value: '* you remind me of *',
      expectedResult: '\\s*(.*)\\s*\\byou remind me of *',
    }, {
      value: '* you are *',
      expectedResult: '\\s*(.*)\\s*\\byou are *',
    }, {
      value: '* you\\b\\s*(.*)\\s*\\bme *',
      expectedResult: '\\s*(.*)\\s*\\byou\\b\\s*(.*)\\s*\\bme *',
    }, {
      value: '* you *',
      expectedResult: '\\s*(.*)\\s*\\byou *',
    }, {
      value: '* no one *',
      expectedResult: '\\s*(.*)\\s*\\bno one *',
    }, {
      value: '* my *',
      expectedResult: '\\s*(.*)\\s*\\bmy *',
    }, {
      value: '* my\\b\\s*(.*)\\s*(family|mother|mom|father|dad|sister|brother|wife|children|child|uncle|aunt|child) *',
      expectedResult: '\\s*(.*)\\s*\\bmy\\b\\s*(.*)\\s*(family|mother|mom|father|dad|sister|brother|wife|children|child|uncle|aunt|child) *',
    }, {
      value: '* my *',
      expectedResult: '\\s*(.*)\\s*\\bmy *',
    }, {
      value: '* can you *',
      expectedResult: '\\s*(.*)\\s*\\bcan you *',
    }, {
      value: '* can i *',
      expectedResult: '\\s*(.*)\\s*\\bcan i *',
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
      expectedResult: "\\s*(.*)\\s*\\bwhy don't you *",
    }, {
      value: "* why can't i *",
      expectedResult: "\\s*(.*)\\s*\\bwhy can't i *",
    }, {
      value: '* (everyone|everybody|nobody|noone) *',
      expectedResult: '\\s*(.*)\\s*\\b(everyone|everybody|nobody|noone) *',
    }, {
      value: '* (be|am|is|are|was)\\s*(.*)\\s*\\blike *',
      expectedResult: '\\s*(.*)\\s*\\b(be|am|is|are|was)\\s*(.*)\\s*\\blike *',
    }];

    Tests.forEach(({ value, expectedResult }, index) => {
      it(`should pass test ${index}`, () => {
        const result = startsWithWildcard(value);
        expect(result).toBe(expectedResult);
      });
    });
  });
});
