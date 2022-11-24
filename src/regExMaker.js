const langConfig = require('./languageConfig');

const RegExStr = {
  BOUNDARY: '\\b',
  WILDCARD: '\\s*(.*)\\s*',
};

const regExes = {
  /** finds "`@happy`" within "`* i am* @happy *`" */
  USE_SYNONYM: /@(\S+)/g,

  /** Inline "*", finds "`u *r`" within "`* do you *remember *`" */
  INLINE_WILDCARD: /(\S)\s*\*\s*(\S)/g,

  /** Starts with a wildcard, finds "`* a`" within "`* are you *`" */
  STARTS_WITH_WILDCARD: /^\s*\*\s*(\S)/,

  /** Ends with a wildcard, finds "`u *`" within "`* are you *`" */
  ENDS_WITH_WILDCARD: /(\S)\s*\*\s*$/,

  /** looks for "`*`" even if it's surrounded by spaces "`   *   `" */
  WILDCARD: /^\s*\*\s*$/,

  /** One or more spaces (anywhere) */
  WHITESPACE: /\s+/g,

  BEGINS_WITH_MEM_FLAG: /^\$\s*/,
};

const synPatternHash = {};

// generate synonym list
function buildSynonymHash() {
  if (langConfig.synonyms && typeof langConfig.synonyms === 'object') {
    // eslint-disable-next-line guard-for-in, no-restricted-syntax
    for (const key in langConfig.synonyms) {
      synPatternHash[key] = `(${key}|${langConfig.synonyms[key].join('|')})`;
    }
  }
}

function endsWithWildcard(regEx) {
  // TODO: legacy meaning of "matches[1] !== '('"
  return regExes.ENDS_WITH_WILDCARD.test(regEx)
    ? regEx.replace(regExes.ENDS_WITH_WILDCARD, `$1${RegExStr.BOUNDARY}${RegExStr.WILDCARD}`)
    : regEx;
}

function inlineWildcards(regEx) {
  if (!regExes.INLINE_WILDCARD.test(regEx)) {
    return regEx;
  }

  const z = /(\S)\s*\*\s*(\S)/;

  return regEx.replace(regExes.INLINE_WILDCARD, (phrase) => {
    let [, firstChar, lastChar] = phrase.match(z);
    if (firstChar !== ')') {
      firstChar += RegExStr.BOUNDARY;
    }

    if ((lastChar !== '(') && (lastChar !== '\\')) {
      lastChar = RegExStr.BOUNDARY + lastChar;
    }

    return `${firstChar}${RegExStr.WILDCARD}${lastChar}`;
  });
}

function startsWithWildcard(regEx) {
  // TODO: legacy meaning of "if ((matches[1] !== ')') && (matches[1] !== '\\')) {"
  return regExes.STARTS_WITH_WILDCARD.test(regEx)
    ? regEx.replace(regExes.STARTS_WITH_WILDCARD, `${RegExStr.WILDCARD}${RegExStr.BOUNDARY}$1`)
    : regEx;
}

function make(pattern) {
  let useMemFlag = false;
  let regEx = `${pattern || ''}`;

  if (regExes.BEGINS_WITH_MEM_FLAG.test(regEx)) {
    regEx = regEx.replace(regExes.BEGINS_WITH_MEM_FLAG, '');
    useMemFlag = true;
  }

  // expand synonyms
  if (regExes.USE_SYNONYM.test(regEx)) {
    regEx = regEx.replace(regExes.USE_SYNONYM, (match, word) => synPatternHash[word] || word);
  }

  // expand `*` (wildcard) expressions
  if (regExes.WILDCARD.test(regEx)) {
    regEx = RegExStr.WILDCARD;
  } else {
    regEx = inlineWildcards(regEx);
    regEx = startsWithWildcard(regEx);
    regEx = endsWithWildcard(regEx);
  }

  // expand white space
  regEx = regEx.replace(regExes.WHITESPACE, '\\s+');

  return {
    regEx,
    useMemFlag,
  };
}

module.exports = {
  __test__: {
    endsWithWildcard,
    inlineWildcards,
    startsWithWildcard,
  },
  init() {
    buildSynonymHash();
  },
  make,
};
