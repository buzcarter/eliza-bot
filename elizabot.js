const ElizaBot = require('./ElizaBotClass');

let bot = null;

const getBot = () => bot ? bot : (bot = new ElizaBot(false));

module.exports = {
  reply (patientInput) {
    return getBot().transform(patientInput);
  },
  start () {
    return getBot().getInitial();
  },
  bye () {
    return getBot().getFinal();
  },
}

