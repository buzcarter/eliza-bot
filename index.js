/* eslint-disable no-console */
const elizabot = require('./elizabot.js');

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

function endSession() {
  process.exit(0);
}

function randomPrompt() {
  const nowTime = Date.now();
  const silenceComfort = Math.floor(Math.random() * (3 * SILENCE_LENGTH) + SILENCE_LENGTH);

  if (numberOfSilences > MAX_NUMBER_OF_SILENCES) {
    const goodbye = silenceTerminations[Math.floor(Math.random() * silenceTerminations.length)];
    console.log(goodbye);
    endSession();
  }

  if (nowTime - lastInteractionTime > silenceComfort) {
    const prompt = silencePrompts[Math.floor(Math.random() * silencePrompts.length)];
    console.log(prompt);
    lastInteractionTime = Date.now();
    numberOfSilences++;
  }
}

function provideFeedback(patientQuery) {
  lastInteractionTime = Date.now();
  numberOfSilences = 0;
  if (patientQuery.toLowerCase() === 'quit' || patientQuery.toLowerCase() === 'q') {
    const goodbye = elizabot.bye();
    console.log(goodbye);
    console.log(asciiDuck);
    endSession();
  }

  const reply = elizabot.reply(patientQuery);
  console.log(reply);
}

function main() {
  const hello = elizabot.start();
  console.log(hello);

  setInterval(randomPrompt, SILENCE_LENGTH);

  const stdin = process.openStdin();
  stdin.addListener('data', (inputText) => {
    // eslint-disable-next-line no-param-reassign
    inputText = inputText.toString().trim();
    provideFeedback(inputText);
  });
}

main();
