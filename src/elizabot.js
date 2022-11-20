const ElizaBot = require('./ElizaBotClass');
const { pickRandom } = require('./utils');

const silencePrompts = [
  'You seem distracted. Should we resume later?',
  'If you\'re busy we can pick up where we\'ve left off later',
  'Perhaps this is a good stopping point. We can do this later if you like.',
  'Should we stop here?',
  'You seem reluctant to chat. Is anything else bothering you?',
  'Do you need to work on something else?',
  'Is this not a good time?',
];

const silenceTerminations = [
  'Let\'s stop here and pickup later when you\'re able to chat with without interrruptions. I\'m here whenever you\'d like, you know that',
];

const options = {
  noRandom: false,
  debugEnabled: false,
};

let bot = null;

// eslint-disable-next-line no-return-assign
const getBot = () => (bot || (bot = new ElizaBot(options)));

module.exports = {
  reply(inputText) {
    return getBot().getReply(inputText);
  },
  greeting() {
    return getBot().getGreeting();
  },
  farewell() {
    return getBot().getFarewell();
  },
  hasQuit() {
    return getBot().quit;
  },
  silenceGoodbye() {
    return pickRandom(silenceTerminations);
  },
  silencePrompt() {
    return pickRandom(silencePrompts);
  },
};
