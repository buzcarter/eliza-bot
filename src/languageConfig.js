/* eslint-disable key-spacing, no-multi-spaces */
const NO_MATCH_KEYWORD = 'xnone';

const greetings = [
  'How do you do. Please tell me your problem.',
  "Please tell me what's been bothering you.",
  'Is something troubling you ?',
  'Im here. Talk to me.',
  'Talk to me',
  'Top of the morning to you.',
  'Thanks for waking me up',
];

const keywords = [{
  keyword: NO_MATCH_KEYWORD,
  weight: 0,
  phrases: [{
    pattern: '*',
    responses: [
      "I'm not sure I understand you fully.",
      'Please go on.',
      'Can you repeat that please ?',
      'What does that suggest to you ?',
      'Do you feel strongly about discussing such things ?',
      'That is interesting.  Please continue.',
      'Tell me more about that.',
      'Do go on.',
      'Please talk more about it',
      'Does talking about this bother you ?',
      'Can you rephrase that ?',
      'I see. Tell me more.',
      'Interesting. Is this something you are sorry about ?',
      'Mmm hmmm. Is this is your favorite subject ?',
      'Now we are getting somewhere. Explain more.',
      'I see. How does that make you feel ?',
    ],
  }],
}, {
  keyword: 'sorry',
  weight: 0,
  phrases: [{
    pattern: '*',
    responses: [
      "Please don't apologize.",
      'Apologies are not necessary.',
      "I've told you that apologies are not required.",
      'It did not bother me.  Please continue.',
      'I have no feelings. Do continue.',
      'There is nothing to worry about',
    ],
  }],
}, {
  keyword: 'apologize',
  weight: 0,
  phrases: [{
    pattern: '*',
    responses: [
      { applyKeyword: 'sorry' },
    ],
  }],
}, {
  keyword: 'remember',
  weight: 5,
  phrases: [{
    pattern: '* i remember *',
    responses: [
      'Do you often think of (2) ?',
      'Does thinking of (2) bring anything else to mind ?',
      'What else do you recollect ?',
      'Why do you remember (2) just now ?',
      'What in the present situation reminds you of (2) ?',
      'What is the connection between me and (2) ?',
      'What else does (2) remind you of ?',
    ],
  }, {
    pattern: '* do you remember *',
    responses: [
      'Did you think I would forget (2) ?',
      'Why do you think I should recall (2) now ?',
      'What about (2) ?',
      'You mentioned (2) ?',
      { applyKeyword: 'what' },
    ],
  }, {
    pattern: '* you remember *',
    responses: [
      'How could I forget (2) ?',
      'What about (2) should I remember ?',
      { applyKeyword: 'you' },
    ],
  }],
}, {
  keyword: 'forget',
  weight: 5,
  phrases: [{
    pattern: '* i forget *',
    responses: [
      'Can you think of why you might forget (2) ?',
      "Why can't you remember (2) ?",
      'How often do you think of (2) ?',
      'Does it bother you to forget that ?',
      'Could it be a mental block ?',
      'Are you generally forgetful ?',
      'Do you think you are suppressing (2) ?',
    ],
  }, {
    pattern: '* did you forget *',
    responses: [
      'Why do you ask ?',
      'Are you sure you told me ?',
      'Would it bother you if I forgot (2) ?',
      'Why should I recall (2) just now ?',
      'Tell me more about (2).',
      { applyKeyword: 'what' },
    ],
  }],
}, {
  keyword: 'if',
  weight: 3,
  phrases: [{
    pattern: '* if *',
    responses: [
      "Do you think it's likely that (2) ?",
      'Do you wish that (2) ?',
      'What do you know about (2) ?',
      'Really, if (2) ?',
      'What would you do if (2) ?',
      'But what are the chances that (2) ?',
      'What does this speculation lead to ?',
    ],
  }],
}, {
  keyword: 'dreamed',
  weight: 4,
  phrases: [{
    pattern: '* i dreamed *',
    responses: [
      'Really, (2) ?',
      'Have you ever fantasized (2) while you were awake ?',
      'Have you ever dreamed (2) before ?',
      { applyKeyword: 'dream' },
    ],
  }],
}, {
  keyword: 'dream',
  weight: 3,
  phrases: [{
    pattern: '*',
    responses: [
      'What does that dream suggest to you ?',
      'Do you dream often ?',
      'What persons appear in your dreams ?',
      'Do you believe that dreams have something to do with your problem ?',
    ],
  }],
}, {
  keyword: 'perhaps',
  weight: 0,
  phrases: [{
    pattern: '*',
    responses: [
      "You don't seem quite certain.",
      'Why the uncertain tone ?',
      "Can't you be more positive ?",
      "You aren't sure ?",
      "Don't you know ?",
      'How likely, would you estimate ?',
    ],
  }],
}, {
  keyword: 'name',
  weight: 15,
  phrases: [{
    pattern: '*',
    responses: [
      'I am not interested in names.',
      'OK, my name is bweezy. What do you need to know ?',
      "I've told you before, I don't care about names -- please continue.",
    ],
  }],
}, {
  keyword: 'deutsch',
  weight: 0,
  phrases: [{
    pattern: '*',
    responses: [
      'Sorry I do not sprechen sie deutsch',
      "I told you before, I don't understand German.",
      { applyKeyword: 'xforeign' },
    ],
  }],
}, {
  keyword: 'francais',
  weight: 0,
  phrases: [{
    pattern: '*',
    responses: [
      'Why? Do you love to go to France?',
      "I told you before, I don't understand French.",
      { applyKeyword: 'xforeign' },
    ],
  }],
}, {
  keyword: 'italiano',
  weight: 0,
  phrases: [{
    pattern: '*',
    responses: [
      'Have you been to Rome?',
      "I told you before, I don't understand Italian.",
      { applyKeyword: 'xforeign' },
    ],
  }],
}, {
  keyword: 'espanol',
  weight: 0,
  phrases: [{
    pattern: '*',
    responses: [
      'Sorry I do not speak Spanish',
      "I told you before, I don't understand Spanish.",
      { applyKeyword: 'xforeign' },
    ],
  }],
}, {
  keyword: 'xforeign',
  weight: 0,
  phrases: [{
    pattern: '*',
    responses: [
      'I speak only English.',
    ],
  }],
}, {
  keyword: 'hello',
  weight: 0,
  phrases: [{
    pattern: '*',
    responses: [
      'How do you do.  Please state your problem.',
      'Hi.  What seems to be your problem ?',
    ],
  }],
}, {
  keyword: 'computer',
  weight: 50,
  phrases: [{
    pattern: '*',
    responses: [
      'Do computers worry you ?',
      'Why do you mention computers ?',
      'What do you think machines have to do with your problem ?',
      "Don't you think computers can help people ?",
      'What about machines worries you ?',
      'What do you think about machines ?',
      "You don't think I am a computer program, do you ?",
    ],
  }],
}, {
  keyword: 'am',
  weight: 0,
  phrases: [{
    pattern: '* am i *',
    responses: [
      'Do you believe you are (2) ?',
      'Would you want to be (2) ?',
      'Do you wish I would tell you you are (2) ?',
      'What would it mean if you were (2) ?',
      { applyKeyword: 'what' },
    ],
  }, {
    pattern: '* i am *',
    responses: [
      { applyKeyword: 'i' },
    ],
  }, {
    pattern: '*',
    responses: [
      "Why do you say 'am' ?",
      "I don't understand that.",
    ],
  }],
}, {
  keyword: 'are',
  weight: 0,
  phrases: [{
    pattern: '* are you *',
    responses: [
      'Why are you interested in whether I am (2) or not ?',
      "Would you prefer if I weren't (2) ?",
      'Perhaps I am (2) in your fantasies.',
      'Do you sometimes think I am (2) ?',
      'Would it matter to you ?',
      'What if I were (2) ?',
      { applyKeyword: 'what' },
    ],
  }, {
    pattern: '* you are *',
    responses: [
      { applyKeyword: 'you' },
    ],
  }, {
    pattern: '* are *',
    responses: [
      'Did you think they might not be (2) ?',
      'Would you like it if they were not (2) ?',
      'What if they were not (2) ?',
      'Are they always (2) ?',
      'Possibly they are (2).',
      'Are you positive they are (2) ?',
    ],
  }],
}, {
  keyword: 'your',
  weight: 0,
  phrases: [{
    pattern: '* your *',
    responses: [
      'Why are you concerned over my (2) ?',
      'What about your own (2) ?',
      "Are you worried about someone else's (2) ?",
      'Really, my (2) ?',
      'What makes you think of my (2) ?',
      'Do you want my (2) ?',
    ],
  }],
}, {
  keyword: 'was',
  weight: 2,
  phrases: [{
    pattern: '* was i *',
    responses: [
      'What if you were (2) ?',
      'Do you think you were (2) ?',
      'Were you (2) ?',
      'What would it mean if you were (2) ?',
      "What does ' (2) ' suggest to you ?",
      { applyKeyword: 'what' },
    ],
  }, {
    pattern: '* i was *',
    responses: [
      'Were you really ?',
      'Why do you tell me you were (2) now ?',
      'Perhaps I already know you were (2).',
    ],
  }, {
    pattern: '* was you *',
    responses: [
      'Would you like to believe I was (2) ?',
      'What suggests that I was (2) ?',
      'What do you think ?',
      'Perhaps I was (2).',
      'What if I had been (2) ?',
    ],
  }],
}, {
  keyword: 'i',
  weight: 0,
  phrases: [{
    pattern: '* i @desire *',
    responses: [
      'What would it mean to you if you got (3) ?',
      'Why do you want (3) ?',
      'Suppose you got (3) soon.',
      'What if you never got (3) ?',
      'What would getting (3) mean to you ?',
      'What does wanting (3) have to do with this discussion ?',
    ],
  }, {
    pattern: '* i am* @sad *',
    responses: [
      'I am sorry to hear that you are (3).',
      'Do you think coming here will help you not to be (3) ?',
      "I'm sure it's not pleasant to be (3).",
    ],
  }, {
    pattern: '* i am* @happy *',
    responses: [
      'How have I helped you to be (3) ?',
      'Has your treatment made you (3) ?',
      'What makes you (3) just now ?',
      'Can you explain why you are suddenly (3) ?',
    ],
  }, {
    pattern: '* i was *',
    responses: [
      { applyKeyword: 'was' },
    ],
  }, {
    pattern: '* i @belief i *',
    responses: [
      'Do you really think so ?',
      'But you are not sure you (3).',
      'Do you really doubt you (3) ?',
    ],
  }, {
    pattern: '* i* @belief *you *',
    responses: [
      { applyKeyword: 'you' },
    ],
  }, {
    pattern: '* i am *',
    responses: [
      'Is it because you are (2) that you came to me ?',
      'How long have you been (2) ?',
      'Do you believe it is normal to be (2) ?',
      'Do you enjoy being (2) ?',
      'Do you know anyone else who is (2) ?',
      'Are you (2) because of your parents ?',
      'Are your friends (2) too ?',
      'Is your spouse (2) too ?',
    ],
  }, {
    pattern: '* i @cannot *',
    responses: [
      "How do you know that you can't (3) ?",
      'Have you tried ?',
      'Perhaps you could (3) now.',
      'Do you really want to be able to (3) ?',
      'What if you could (3) ?',
    ],
  }, {
    pattern: "* i don't *",
    responses: [
      "Don't you really (2) ?",
      "Why don't you (2) ?",
      'Do you wish to be able to (2) ?',
      'Does that trouble you ?',
    ],
  }, {
    pattern: '* i feel *',
    responses: [
      'Tell me more about such feelings.',
      'Do you often feel (2) ?',
      'Do you enjoy feeling (2) ?',
      'Of what does feeling (2) remind you ?',
    ],
  }, {
    pattern: '* i * you *',
    responses: [
      'Perhaps in your fantasies we (2) each other.',
      'Do you wish to (2) me ?',
      'You seem to need to (2) me.',
      'Do you (2) anyone else ?',
    ],
  }, {
    pattern: '*',
    responses: [
      'You say (1) ?',
      'Can you elaborate on that ?',
      'Do you say (1) for some special reason ?',
      '(1). Really?',
      'When did you first think about (1)',
    ],
  }],
}, {
  keyword: 'you',
  weight: 0,
  phrases: [{
    pattern: '* you remind me of *',
    responses: [
      { applyKeyword: 'alike' },
    ],
  }, {
    pattern: '* you are *',
    responses: [
      'What makes you think I am (2) ?',
      'Does it please you to believe I am (2) ?',
      'Do you sometimes wish you were (2) ?',
      'Perhaps you would like to be (2).',
    ],
  }, {
    pattern: '* you* me *',
    responses: [
      'Why do you think I (2) you ?',
      "You like to think I (2) you -- don't you ?",
      'What makes you think I (2) you ?',
      'Really, I (2) you ?',
      'Do you wish to believe I (2) you ?',
      'Suppose I did (2) you -- what would that mean ?',
      'Does someone else believe I (2) you ?',
    ],
  }, {
    pattern: '* you *',
    responses: [
      'We were discussing you -- not me.',
      'Oh, I (2) ?',
      "You're not really talking about me -- are you ?",
      'What are your feelings now ?',
    ],
  }],
}, {
  keyword: 'yes',
  weight: 0,
  phrases: [{
    pattern: '*',
    responses: [
      'You seem to be quite positive.',
      'You are sure.',
      'I see.',
      'I understand.',
    ],
  }],
}, {
  keyword: 'no',
  weight: 0,
  phrases: [{
    pattern: '* no one *',
    responses: [
      'Are you sure, no one (2) ?',
      'Surely someone (2) .',
      'Can you think of anyone at all ?',
      'Are you thinking of a very special person ?',
      'Who, may I ask ?',
      "You have a particular person in mind, don't you ?",
      'Who do you think you are talking about ?',
    ],
  }, {
    pattern: '*',
    responses: [
      'Are you saying no just to be negative?',
      'You are being a bit negative.',
      'Why not ?',
      "Why 'no' ?",
    ],
  }],
}, {
  keyword: 'my',
  weight: 2,
  phrases: [{
    pattern: '* my *',
    saveForLater: true,
    responses: [
      'Does that have anything to do with the fact that your (2) ?',
      'Lets discuss further why your (2).',
      'Earlier you said your (2).',
      'But your (2).',
    ],
  }, {
    pattern: '* my* @family *',
    responses: [
      'Tell me more about your family.',
      'Who else in your family (4) ?',
      'Your (3) ?',
      'What else comes to your mind when you think of your (3) ?',
    ],
  }, {
    pattern: '* my *',
    responses: [
      'Your (2) ?',
      'Why do you say your (2) ?',
      'Do you like your (2) ?',
      'Do you have more than 1 (2) ?',
      'Does that suggest anything else which belongs to you ?',
      'Is it important to you that you have your (2) ?',
    ],
  }],
}, {
  keyword: 'can',
  weight: 0,
  phrases: [{
    pattern: '* can you *',
    responses: [
      "You believe I can (2) don't you ?",
      'You want me to be able to (2).',
      'Perhaps you would like to be able to (2) yourself.',
      { applyKeyword: 'what' },
    ],
  }, {
    pattern: '* can i *',
    responses: [
      'Whether or not you can (2) depends on you more than on me.',
      'Do you want to be able to (2) ?',
      "Perhaps you don't want to (2).",
      { applyKeyword: 'what' },
    ],
  }],
}, {
  keyword: 'what',
  weight: 0,
  phrases: [{
    pattern: '*',
    responses: [
      'Why do you ask ?',
      'Does that question interest you ?',
      'What is it you really want to know ?',
      'Are such questions much on your mind ?',
      'What answer would please you most ?',
      'What do you think ?',
      'What comes to mind when you ask that ?',
      'Have you asked such questions before ?',
      'Have you asked anyone else ?',
    ],
  }],
}, {
  keyword: 'who',
  weight: 0,
  phrases: [{
    pattern: 'who *',
    responses: [
      { applyKeyword: 'what' },
    ],
  }],
}, {
  keyword: 'when',
  weight: 0,
  phrases: [{
    pattern: 'when *',
    responses: [
      { applyKeyword: 'what' },
    ],
  }],
}, {
  keyword: 'where',
  weight: 0,
  phrases: [{
    pattern: 'where *',
    responses: [
      { applyKeyword: 'what' },
    ],
  }],
}, {
  keyword: 'how',
  weight: 0,
  phrases: [{
    pattern: 'how *',
    responses: [
      { applyKeyword: 'what' },
    ],
  }],
}, {
  keyword: 'because',
  weight: 0,
  phrases: [{
    pattern: '*',
    responses: [
      'Is that the real reason ?',
      "Don't any other reasons come to mind ?",
      'Does that reason seem to explain anything else ?',
      'What other reasons might there be ?',
    ],
  }],
}, {
  keyword: 'why',
  weight: 0,
  phrases: [{
    pattern: "* why don't you *",
    responses: [
      "Do you believe I don't (2) ?",
      'Perhaps I will (2) in good time.',
      'Should you (2) yourself ?',
      'You want me to (2) ?',
      { applyKeyword: 'what' },
    ],
  }, {
    pattern: "* why can't i *",
    responses: [
      'Do you think you should be able to (2) ?',
      'Do you want to be able to (2) ?',
      'Do you believe this will help you to (2) ?',
      "Have you any idea why you can't (2) ?",
      { applyKeyword: 'what' },
    ],
  }, {
    pattern: '*',
    responses: [
      { applyKeyword: 'what' },
    ],
  }],
}, {
  keyword: 'everyone',
  weight: 2,
  phrases: [{
    pattern: '* @everyone *',
    responses: [
      'Really, (2) ?',
      'Surely not (2).',
      'Can you think of anyone in particular ?',
      'Who, for example?',
      'Are you thinking of a very special person ?',
      'Who, may I ask ?',
      'Someone special perhaps ?',
      "You have a particular person in mind, don't you ?",
      "Who do you think you're talking about ?",
    ],
  }],
}, {
  keyword: 'everybody',
  weight: 2,
  phrases: [{
    pattern: '*',
    responses: [
      { applyKeyword: 'everyone' },
    ],
  }],
}, {
  keyword: 'nobody',
  weight: 2,
  phrases: [{
    pattern: '*',
    responses: [
      { applyKeyword: 'everyone' },
    ],
  }],
}, {
  keyword: 'noone',
  weight: 2,
  phrases: [{
    pattern: '*',
    responses: [
      { applyKeyword: 'everyone' },
    ],
  }],
}, {
  keyword: 'always',
  weight: 1,
  phrases: [{
    pattern: '*',
    responses: [
      'Can you think of a specific example ?',
      'When ?',
      'What incident are you thinking of ?',
      'Really, always ?',
    ],
  }],
}, {
  keyword: 'alike',
  weight: 10,
  phrases: [{
    pattern: '*',
    responses: [
      'In what way ?',
      'What resemblence do you see ?',
      'What does that similarity suggest to you ?',
      'What other connections do you see ?',
      'What do you suppose that resemblence means ?',
      'What is the connection, do you suppose ?',
      'Could there really be some connection ?',
      'How ?',
    ],
  }],
}, {
  keyword: 'like',
  weight: 10,
  phrases: [{
    pattern: '* @be *like *',
    responses: [
      { applyKeyword: 'alike' },
    ],
  }],
}, {
  keyword: 'different',
  weight: 0,
  phrases: [{
    pattern: '*',
    responses: [
      'How is it different ?',
      'What differences do you see ?',
      'What does that difference suggest to you ?',
      'What other distinctions do you see ?',
      'What do you suppose that disparity means ?',
      'Could there be some connection, do you suppose ?',
      'How ?',
    ],
  }],
}];

const postTransforms = [
  { pattern: / old old/g,                                   replacement: ' old' },
  { pattern: /\bthey were( not)? me\b/g,                    replacement: 'it was$1 me' },
  { pattern: /\bthey are( not)? me\b/g,                     replacement: 'it is$1 me' },
  { pattern: /Are they( always)? me\b/,                     replacement: 'it is$1 me' },
  { pattern: /\bthat your( own)? (\w+)( now)? \?/,          replacement: 'that you have your$1 $2 ?' },
  { pattern: /\bI to have (\w+)/,                           replacement: 'I have $1' },
  { pattern: /Earlier you said your( own)? (\w+)( now)?\./, replacement: 'Earlier you talked about your $2.' },
];

const farewells = [
  'Goodbye. It was nice talking to you.',
  // additions (not original)
  'Goodbye. This was really a nice talk.',
  "Goodbye. I'm looking forward to our next session.",
  "This was a good session, wasn't it -- but time is over now.  Goodbye.",
  'Maybe we could discuss this moreover in our next session?  Goodbye.',
];

const quitCommands = [
  'bye',
  'done',
  'exit',
  'goodbye',
  'quit',
];

/**
 * %pre
 * * `Hash`: words which are replaced before any transformations;
 * * `Values`: the respective replacement words.
 */
const pres = {
  dont:         "don't",
  cant:         "can't",
  wont:         "won't",
  recollect:    'remember',
  recall:       'remember',
  dreamt:       'dreamed',
  dreams:       'dream',
  maybe:        'perhaps',
  certainly:    'yes',
  machine:      'computer',
  machines:     'computer',
  computers:    'computer',
  were:         'was',
  "you're":     'you are',
  "i'm":        'i am',
  same:         'alike',
  identical:    'alike',
  equivalent:   'alike',
};

/**
 * %post
 * * `Hash`: words which are replaced after the transformations and after the reply is constructed;
 * * `Values`: the respective replacement words.
 */
const post = {
  am:       'are',
  your:     'my',
  me:       'you',
  myself:   'yourself',
  yourself: 'myself',
  "i'm":      'you are',
  i:        'you',
  you:      'I',
  my:       'your',
};

/**
 * %synon
 * * `Hash`: words which are found in decomposition rules;
 * * `Values`: words which are treated just like their corresponding synonyms during matching of decomposition rules.
 */
const synonyms = {
  be:       ['am', 'is', 'are', 'was'],
  belief:   ['feel', 'think', 'believe', 'wish'],
  cannot:   ["can't"],
  desire:   ['want', 'need'],
  everyone: ['everybody', 'nobody', 'noone'],
  family:   ['mother', 'mom', 'father', 'dad', 'sister', 'brother', 'wife', 'children', 'child', 'uncle', 'aunt', 'child'],
  happy:    ['elated', 'glad', 'better'],
  sad:      ['unhappy', 'depressed', 'sick'],
};

module.exports = {
  NO_MATCH_KEYWORD,
  farewells,
  greetings,
  keywords,
  post,
  postTransforms,
  pres,
  synonyms,
  quitCommands,
};
