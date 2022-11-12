const ElizaBot = require('./ElizaBotClass');

const options = {
  noRandom: false,
  debugEnabled: true,
};

let bot = null;

// eslint-disable-next-line no-return-assign
const getBot = () => (bot || (bot = new ElizaBot(options)));

module.exports = {
  reply(patientInput) {
    return getBot().transform(patientInput);
  },
  start() {
    return getBot().getInitial();
  },
  bye() {
    return getBot().getFinal();
  },
  hasQuit() {
    return getBot().quit;
  },
};
