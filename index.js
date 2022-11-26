/* eslint-disable no-console */
const elizabot = require('./src/elizabot.js');

const SILENCE_LENGTH = 15000;
const MAX_NUMBER_OF_SILENCES = 4;

let lastInteractionTime = Date.now();
let numberOfSilences = 0;

const asciiDuck = `
  __
<(o )___
 ( ._> /
  \`---'
`;

function endSession() {
  console.log(asciiDuck);
  process.exit(0);
}

function randomPrompt() {
  const nowTime = Date.now();
  const silenceComfort = Math.floor(Math.random() * (3 * SILENCE_LENGTH) + SILENCE_LENGTH);

  if (numberOfSilences > MAX_NUMBER_OF_SILENCES) {
    console.log(elizabot.silenceGoodbye());
    endSession();
  }

  if (nowTime - lastInteractionTime > silenceComfort) {
    console.log(elizabot.silencePrompt());
    lastInteractionTime = Date.now();
    numberOfSilences++;
  }
}

function provideFeedback(inputText) {
  lastInteractionTime = Date.now();
  numberOfSilences = 0;

  console.log(elizabot.reply(inputText));
  if (elizabot.hasQuit()) {
    endSession();
  }
}

function main() {
  console.log(elizabot.greeting());

  setInterval(randomPrompt, SILENCE_LENGTH);

  const stdin = process.openStdin();
  stdin.addListener('data', (inputText) => {
    // eslint-disable-next-line no-param-reassign
    inputText = inputText.toString().trim();
    provideFeedback(inputText);
  });
}

main();
