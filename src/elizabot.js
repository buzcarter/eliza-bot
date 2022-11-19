const ElizaBot = require('./ElizaBotClass');

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
  start() {
    return getBot().getGreeting();
  },
  bye() {
    return getBot().getFarewell();
  },
  hasQuit() {
    return getBot().quit;
  },
};
