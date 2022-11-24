const regExMaker = require('./regExMaker');

describe('regExMaker', () => {
  describe('endsWithWildcard', () => {
    const { __test__: { endsWithWildcard } } = regExMaker;

    const Tests = [{
      value: '\\s*(.*)\\s*\\bi remember *',
      expectedResult: '\\s*(.*)\\s*\\bi remember\\b\\s*(.*)\\s*',
    }, {
      value: '\\s*(.*)\\s*\\bdo you remember *',
      expectedResult: '\\s*(.*)\\s*\\bdo you remember\\b\\s*(.*)\\s*',
    }, {
      value: '\\s*(.*)\\s*\\byou remember *',
      expectedResult: '\\s*(.*)\\s*\\byou remember\\b\\s*(.*)\\s*',
    }, {
      value: '\\s*(.*)\\s*\\bi forget *',
      expectedResult: '\\s*(.*)\\s*\\bi forget\\b\\s*(.*)\\s*',
    }, {
      value: '\\s*(.*)\\s*\\bdid you forget *',
      expectedResult: '\\s*(.*)\\s*\\bdid you forget\\b\\s*(.*)\\s*',
    }, {
      value: '\\s*(.*)\\s*\\bif *',
      expectedResult: '\\s*(.*)\\s*\\bif\\b\\s*(.*)\\s*',
    }, {
      value: '\\s*(.*)\\s*\\bi dreamed *',
      expectedResult: '\\s*(.*)\\s*\\bi dreamed\\b\\s*(.*)\\s*',
    }, {
      value: '\\s*(.*)\\s*\\bam i *',
      expectedResult: '\\s*(.*)\\s*\\bam i\\b\\s*(.*)\\s*',
    }, {
      value: '\\s*(.*)\\s*\\bi am *',
      expectedResult: '\\s*(.*)\\s*\\bi am\\b\\s*(.*)\\s*',
    }, {
      value: '\\s*(.*)\\s*\\bare you *',
      expectedResult: '\\s*(.*)\\s*\\bare you\\b\\s*(.*)\\s*',
    }, {
      value: '\\s*(.*)\\s*\\byou are *',
      expectedResult: '\\s*(.*)\\s*\\byou are\\b\\s*(.*)\\s*',
    }, {
      value: '\\s*(.*)\\s*\\bare *',
      expectedResult: '\\s*(.*)\\s*\\bare\\b\\s*(.*)\\s*',
    }, {
      value: '\\s*(.*)\\s*\\byour *',
      expectedResult: '\\s*(.*)\\s*\\byour\\b\\s*(.*)\\s*',
    }, {
      value: '\\s*(.*)\\s*\\bwas i *',
      expectedResult: '\\s*(.*)\\s*\\bwas i\\b\\s*(.*)\\s*',
    }, {
      value: '\\s*(.*)\\s*\\bi was *',
      expectedResult: '\\s*(.*)\\s*\\bi was\\b\\s*(.*)\\s*',
    }, {
      value: '\\s*(.*)\\s*\\bwas you *',
      expectedResult: '\\s*(.*)\\s*\\bwas you\\b\\s*(.*)\\s*',
    }, {
      value: '\\s*(.*)\\s*\\bi (desire|want|need) *',
      expectedResult: '\\s*(.*)\\s*\\bi (desire|want|need)\\b\\s*(.*)\\s*',
    }, {
      value: '\\s*(.*)\\s*\\bi am\\b\\s*(.*)\\s*(sad|unhappy|depressed|sick) *',
      expectedResult: '\\s*(.*)\\s*\\bi am\\b\\s*(.*)\\s*(sad|unhappy|depressed|sick)\\b\\s*(.*)\\s*',
    }, {
      value: '\\s*(.*)\\s*\\bi am\\b\\s*(.*)\\s*(happy|elated|glad|better) *',
      expectedResult: '\\s*(.*)\\s*\\bi am\\b\\s*(.*)\\s*(happy|elated|glad|better)\\b\\s*(.*)\\s*',
    }, {
      value: '\\s*(.*)\\s*\\bi was *',
      expectedResult: '\\s*(.*)\\s*\\bi was\\b\\s*(.*)\\s*',
    }, {
      value: '\\s*(.*)\\s*\\bi (belief|feel|think|believe|wish) i *',
      expectedResult: '\\s*(.*)\\s*\\bi (belief|feel|think|believe|wish) i\\b\\s*(.*)\\s*',
    }, {
      value: '\\s*(.*)\\s*\\bi\\b\\s*(.*)\\s*(belief|feel|think|believe|wish)\\s*(.*)\\s*\\byou *',
      expectedResult: '\\s*(.*)\\s*\\bi\\b\\s*(.*)\\s*(belief|feel|think|believe|wish)\\s*(.*)\\s*\\byou\\b\\s*(.*)\\s*',
    }, {
      value: '\\s*(.*)\\s*\\bi am *',
      expectedResult: '\\s*(.*)\\s*\\bi am\\b\\s*(.*)\\s*',
    }, {
      value: "\\s*(.*)\\s*\\bi (cannot|can't) *",
      expectedResult: "\\s*(.*)\\s*\\bi (cannot|can't)\\b\\s*(.*)\\s*",
    }, {
      value: "\\s*(.*)\\s*\\bi don't *",
      expectedResult: "\\s*(.*)\\s*\\bi don't\\b\\s*(.*)\\s*",
    }, {
      value: '\\s*(.*)\\s*\\bi feel *',
      expectedResult: '\\s*(.*)\\s*\\bi feel\\b\\s*(.*)\\s*',
    }, {
      value: '\\s*(.*)\\s*\\bi\\b\\s*(.*)\\s*\\byou *',
      expectedResult: '\\s*(.*)\\s*\\bi\\b\\s*(.*)\\s*\\byou\\b\\s*(.*)\\s*',
    }, {
      value: '\\s*(.*)\\s*\\byou remind me of *',
      expectedResult: '\\s*(.*)\\s*\\byou remind me of\\b\\s*(.*)\\s*',
    }, {
      value: '\\s*(.*)\\s*\\byou are *',
      expectedResult: '\\s*(.*)\\s*\\byou are\\b\\s*(.*)\\s*',
    }, {
      value: '\\s*(.*)\\s*\\byou\\b\\s*(.*)\\s*\\bme *',
      expectedResult: '\\s*(.*)\\s*\\byou\\b\\s*(.*)\\s*\\bme\\b\\s*(.*)\\s*',
    }, {
      value: '\\s*(.*)\\s*\\byou *',
      expectedResult: '\\s*(.*)\\s*\\byou\\b\\s*(.*)\\s*',
    }, {
      value: '\\s*(.*)\\s*\\bno one *',
      expectedResult: '\\s*(.*)\\s*\\bno one\\b\\s*(.*)\\s*',
    }, {
      value: '\\s*(.*)\\s*\\bmy *',
      expectedResult: '\\s*(.*)\\s*\\bmy\\b\\s*(.*)\\s*',
    }, {
      value: '\\s*(.*)\\s*\\bmy\\b\\s*(.*)\\s*(family|mother|mom|father|dad|sister|brother|wife|children|child|uncle|aunt|child) *',
      expectedResult: '\\s*(.*)\\s*\\bmy\\b\\s*(.*)\\s*(family|mother|mom|father|dad|sister|brother|wife|children|child|uncle|aunt|child)\\b\\s*(.*)\\s*',
    }, {
      value: '\\s*(.*)\\s*\\bmy *',
      expectedResult: '\\s*(.*)\\s*\\bmy\\b\\s*(.*)\\s*',
    }, {
      value: '\\s*(.*)\\s*\\bcan you *',
      expectedResult: '\\s*(.*)\\s*\\bcan you\\b\\s*(.*)\\s*',
    }, {
      value: '\\s*(.*)\\s*\\bcan i *',
      expectedResult: '\\s*(.*)\\s*\\bcan i\\b\\s*(.*)\\s*',
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
      value: "\\s*(.*)\\s*\\bwhy don't you *",
      expectedResult: "\\s*(.*)\\s*\\bwhy don't you\\b\\s*(.*)\\s*",
    }, {
      value: "\\s*(.*)\\s*\\bwhy can't i *",
      expectedResult: "\\s*(.*)\\s*\\bwhy can't i\\b\\s*(.*)\\s*",
    }, {
      value: '\\s*(.*)\\s*\\b(everyone|everybody|nobody|noone) *',
      expectedResult: '\\s*(.*)\\s*\\b(everyone|everybody|nobody|noone)\\b\\s*(.*)\\s*',
    }, {
      value: '\\s*(.*)\\s*\\b(be|am|is|are|was)\\s*(.*)\\s*\\blike *',
      expectedResult: '\\s*(.*)\\s*\\b(be|am|is|are|was)\\s*(.*)\\s*\\blike\\b\\s*(.*)\\s*',
    }];

    Tests.forEach(({ value, expectedResult }, index) => {
      it(`should pass test ${index}`, () => {
        const result = endsWithWildcard(value);
        expect(result).toBe(expectedResult);
      });
    });
  });
});
