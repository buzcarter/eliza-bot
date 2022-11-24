const langConfig = require('./languageConfig');

const RegExStr = {
  BOUNDARY: '\\b',
  WILDCARD: '\\s*(.*)\\s*',
};

const regExes = {
  /** finds "`@happy`" within "`* i am* @happy *`" */
  USE_SYNONYM: /@(\S+)/g,

  /** Inline "*", finds "`u *r`" within "`* do you *remember *`" */
  INLINE_WILDCARD: /(\S)\s*\*\s*(\S)/,

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
  if (regExes.ENDS_WITH_WILDCARD.test(regEx)) {
    const matches = regExes.ENDS_WITH_WILDCARD.exec(regEx);
    let patternTxt = regEx.substring(0, matches.index + 1);
    if (matches[1] !== '(') {
      patternTxt += RegExStr.BOUNDARY;
    }
    regEx = `${patternTxt}${RegExStr.WILDCARD}`;
  }
  return regEx;
}

function inlineWildcards(regEx) {
  if (regExes.INLINE_WILDCARD.test(regEx)) {
    let matches = regExes.INLINE_WILDCARD.exec(regEx);
    let leftPart = '';
    let rightPart = regEx;
    while (matches) {
      leftPart += rightPart.substring(0, matches.index + 1);
      if (matches[1] !== ')') {
        leftPart += RegExStr.BOUNDARY;
      }
      leftPart += RegExStr.WILDCARD;
      if ((matches[2] !== '(') && (matches[2] !== '\\')) {
        leftPart += RegExStr.BOUNDARY;
      }
      leftPart += matches[2];
      rightPart = rightPart.substring(matches.index + matches[0].length);
      matches = regExes.INLINE_WILDCARD.exec(rightPart);
    }
    regEx = leftPart + rightPart;
  }
  return regEx;
}

function startsWithWildcard(regEx) {
  if (regExes.STARTS_WITH_WILDCARD.test(regEx)) {
    const matches = regExes.STARTS_WITH_WILDCARD.exec(regEx);
    let patternTxt = RegExStr.WILDCARD;
    if ((matches[1] !== ')') && (matches[1] !== '\\')) {
      patternTxt += RegExStr.BOUNDARY;
    }
    regEx = patternTxt + regEx.substring(matches.index - 1 + matches[0].length);
  }
  return regEx;
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
