const langConfig = require('./languageConfig');

const RegExStr = {
  BOUNDARY: '\\b',
  WILDCARD: '\\s*(.*)\\s*',
};

const regExes = {
  /** finds "`@happy`" within "`* i am* @happy *`" */
  AT_VAR_NAMES: /@(\S+)/,
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
};

const synPatterns = {};

// generate synonym list
function buildSynonymHash() {
  if (langConfig.synonyms && typeof langConfig.synonyms === 'object') {
    // eslint-disable-next-line guard-for-in, no-restricted-syntax
    for (const key in langConfig.synonyms) {
      synPatterns[key] = `(${key}|${langConfig.synonyms[key].join('|')})`;
    }
  }
}

function make(pattern) {
  let useMemFlag = false;
  let regEx = pattern;

  // check mem flag and store it as decomp's element 2
  if (regEx.charAt(0) === '$') {
    let offset = 1;
    while (regEx.charAt[offset] === ' ') offset++;
    regEx = regEx.substring(offset);
    useMemFlag = true;
  }

  // expand synonyms
  let atVarsMatches = regExes.AT_VAR_NAMES.exec(regEx);
  while (atVarsMatches) {
    const synonTxt = synPatterns[atVarsMatches[1]] ? synPatterns[atVarsMatches[1]] : atVarsMatches[1];
    regEx = regEx.substring(0, atVarsMatches.index) + synonTxt + regEx.substring(atVarsMatches.index + atVarsMatches[0].length);
    atVarsMatches = regExes.AT_VAR_NAMES.exec(regEx);
  }

  // expand asterisk expressions
  if (regExes.WILDCARD.test(regEx)) {
    regEx = RegExStr.WILDCARD;
  } else {
    let inlineMatches = regExes.INLINE_WILDCARD.exec(regEx);
    if (inlineMatches) {
      let leftPart = '';
      let rightPart = regEx;
      while (inlineMatches) {
        leftPart += rightPart.substring(0, inlineMatches.index + 1);
        if (inlineMatches[1] !== ')') {
          leftPart += RegExStr.BOUNDARY;
        }
        leftPart += RegExStr.WILDCARD;
        if ((inlineMatches[2] !== '(') && (inlineMatches[2] !== '\\')) {
          leftPart += RegExStr.BOUNDARY;
        }
        leftPart += inlineMatches[2];
        rightPart = rightPart.substring(inlineMatches.index + inlineMatches[0].length);
        inlineMatches = regExes.INLINE_WILDCARD.exec(rightPart);
      }
      regEx = leftPart + rightPart;
    }

    const startsMatches = regExes.STARTS_WITH_WILDCARD.exec(regEx);
    if (startsMatches) {
      let patternTxt = RegExStr.WILDCARD;
      if ((startsMatches[1] !== ')') && (startsMatches[1] !== '\\')) {
        patternTxt += RegExStr.BOUNDARY;
      }
      regEx = patternTxt + regEx.substring(startsMatches.index - 1 + startsMatches[0].length);
    }

    const endsMatches = regExes.ENDS_WITH_WILDCARD.exec(regEx);
    if (endsMatches) {
      let patternTxt = regEx.substring(0, endsMatches.index + 1);
      if (endsMatches[1] !== '(') {
        patternTxt += RegExStr.BOUNDARY;
      }
      regEx = `${patternTxt}${RegExStr.WILDCARD}`;
    }
  }

  // expand white space
  regEx = regEx.replace(regExes.WHITESPACE, '\\s+');

  return {
    regEx,
    useMemFlag,
  };
}

module.exports = {
  init() {
    buildSynonymHash();
  },
  make,
};
