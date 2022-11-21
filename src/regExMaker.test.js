const regExMaker = require('./regExMaker');

/* eslint-disable no-multi-spaces */
const Tests = [
  { value: '*',                    expectedResult: '\\s*(.*)\\s*' },
  { value: '* @be *like *',        expectedResult: '\\s*(.*)\\s*\\b(be|am|is|are|was)\\s*(.*)\\s*\\blike\\b\\s*(.*)\\s*' },
  { value: '* @everyone *',        expectedResult: '\\s*(.*)\\s*\\b(everyone|everybody|nobody|noone)\\b\\s*(.*)\\s*' },
  { value: '* am i *',             expectedResult: '\\s*(.*)\\s*\\bam\\s+i\\b\\s*(.*)\\s*' },
  { value: '* are *',              expectedResult: '\\s*(.*)\\s*\\bare\\b\\s*(.*)\\s*' },
  { value: '* are you *',          expectedResult: '\\s*(.*)\\s*\\bare\\s+you\\b\\s*(.*)\\s*' },
  { value: '* can i *',            expectedResult: '\\s*(.*)\\s*\\bcan\\s+i\\b\\s*(.*)\\s*' },
  { value: '* can you *',          expectedResult: '\\s*(.*)\\s*\\bcan\\s+you\\b\\s*(.*)\\s*' },
  { value: '* did you forget *',   expectedResult: '\\s*(.*)\\s*\\bdid\\s+you\\s+forget\\b\\s*(.*)\\s*' },
  { value: '* do you remember *',  expectedResult: '\\s*(.*)\\s*\\bdo\\s+you\\s+remember\\b\\s*(.*)\\s*' },
  { value: '* i @belief i *',      expectedResult: '\\s*(.*)\\s*\\bi\\s+(belief|feel|think|believe|wish)\\s+i\\b\\s*(.*)\\s*' },
  { value: '* i @cannot *',        expectedResult: "\\s*(.*)\\s*\\bi\\s+(cannot|can't)\\b\\s*(.*)\\s*" },
  { value: '* i @desire *',        expectedResult: '\\s*(.*)\\s*\\bi\\s+(desire|want|need)\\b\\s*(.*)\\s*' },
  { value: '* i * you *',          expectedResult: '\\s*(.*)\\s*\\bi\\b\\s*(.*)\\s*\\byou\\b\\s*(.*)\\s*' },
  { value: '* i am *',             expectedResult: '\\s*(.*)\\s*\\bi\\s+am\\b\\s*(.*)\\s*' },
  { value: '* i am* @happy *',     expectedResult: '\\s*(.*)\\s*\\bi\\s+am\\b\\s*(.*)\\s*(happy|elated|glad|better)\\b\\s*(.*)\\s*' },
  { value: '* i am* @sad *',       expectedResult: '\\s*(.*)\\s*\\bi\\s+am\\b\\s*(.*)\\s*(sad|unhappy|depressed|sick)\\b\\s*(.*)\\s*' },
  { value: '* i dreamed *',        expectedResult: '\\s*(.*)\\s*\\bi\\s+dreamed\\b\\s*(.*)\\s*' },
  { value: '* i feel *',           expectedResult: '\\s*(.*)\\s*\\bi\\s+feel\\b\\s*(.*)\\s*' },
  { value: '* i forget *',         expectedResult: '\\s*(.*)\\s*\\bi\\s+forget\\b\\s*(.*)\\s*' },
  { value: '* i remember *',       expectedResult: '\\s*(.*)\\s*\\bi\\s+remember\\b\\s*(.*)\\s*' },
  { value: '* i was *',            expectedResult: '\\s*(.*)\\s*\\bi\\s+was\\b\\s*(.*)\\s*' },
  { value: '* i* @belief *you *',  expectedResult: '\\s*(.*)\\s*\\bi\\b\\s*(.*)\\s*(belief|feel|think|believe|wish)\\s*(.*)\\s*\\byou\\b\\s*(.*)\\s*' },
  { value: '* if *',               expectedResult: '\\s*(.*)\\s*\\bif\\b\\s*(.*)\\s*' },
  { value: '* my *',               expectedResult: '\\s*(.*)\\s*\\bmy\\b\\s*(.*)\\s*' },
  { value: '* my* @family *',      expectedResult: '\\s*(.*)\\s*\\bmy\\b\\s*(.*)\\s*(family|mother|mom|father|dad|sister|brother|wife|children|child|uncle|aunt|child)\\b\\s*(.*)\\s*' },
  { value: '* no one *',           expectedResult: '\\s*(.*)\\s*\\bno\\s+one\\b\\s*(.*)\\s*' },
  { value: '* was i *',            expectedResult: '\\s*(.*)\\s*\\bwas\\s+i\\b\\s*(.*)\\s*' },
  { value: '* was you *',          expectedResult: '\\s*(.*)\\s*\\bwas\\s+you\\b\\s*(.*)\\s*' },
  { value: '* you *',              expectedResult: '\\s*(.*)\\s*\\byou\\b\\s*(.*)\\s*' },
  { value: '* you are *',          expectedResult: '\\s*(.*)\\s*\\byou\\s+are\\b\\s*(.*)\\s*' },
  { value: '* you remember *',     expectedResult: '\\s*(.*)\\s*\\byou\\s+remember\\b\\s*(.*)\\s*' },
  { value: '* you remind me of *', expectedResult: '\\s*(.*)\\s*\\byou\\s+remind\\s+me\\s+of\\b\\s*(.*)\\s*' },
  { value: '* you* me *',          expectedResult: '\\s*(.*)\\s*\\byou\\b\\s*(.*)\\s*\\bme\\b\\s*(.*)\\s*' },
  { value: '* your *',             expectedResult: '\\s*(.*)\\s*\\byour\\b\\s*(.*)\\s*' },
  { value: "* i don't *",          expectedResult: "\\s*(.*)\\s*\\bi\\s+don't\\b\\s*(.*)\\s*" },
  { value: "* why can't i *",      expectedResult: "\\s*(.*)\\s*\\bwhy\\s+can't\\s+i\\b\\s*(.*)\\s*" },
  { value: "* why don't you *",    expectedResult: "\\s*(.*)\\s*\\bwhy\\s+don't\\s+you\\b\\s*(.*)\\s*" },
  { value: '$ * my *',             expectedResult: '\\s*(.*)\\s*\\bmy\\b\\s*(.*)\\s*' },
  { value: 'how *',                expectedResult: 'how\\b\\s*(.*)\\s*' },
  { value: 'when *',               expectedResult: 'when\\b\\s*(.*)\\s*' },
  { value: 'where *',              expectedResult: 'where\\b\\s*(.*)\\s*' },
  { value: 'who *',                expectedResult: 'who\\b\\s*(.*)\\s*' },
];

describe('regExMaker', () => {
  beforeAll(() => {
    regExMaker.init();
  });

  describe('make', () => {
    Tests.forEach(({ value, expectedResult }) => {
      it(`should "correct" make regular expression "${expectedResult}"`, () => {
        const { regEx } = regExMaker.make(value);
        expect(regEx).toBe(expectedResult);
      });
    });
  });
});
