const langConfig = require('./languageConfig');

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
  let newRegExStr = pattern;

  // check mem flag and store it as decomp's element 2
  if (newRegExStr.charAt(0) === '$') {
    let offset = 1;
    while (newRegExStr.charAt[offset] === ' ') offset++;
    newRegExStr = newRegExStr.substring(offset);
    useMemFlag = true;
  }

  // expand synonyms
  let atVarsMatches = regExes.AT_VAR_NAMES.exec(newRegExStr);
  while (atVarsMatches) {
    const synonTxt = synPatterns[atVarsMatches[1]] ? synPatterns[atVarsMatches[1]] : atVarsMatches[1];
    newRegExStr = newRegExStr.substring(0, atVarsMatches.index) + synonTxt + newRegExStr.substring(atVarsMatches.index + atVarsMatches[0].length);
    atVarsMatches = regExes.AT_VAR_NAMES.exec(newRegExStr);
  }

  // expand asterisk expressions
  if (regExes.WILDCARD.test(newRegExStr)) {
    newRegExStr = '\\s*(.*)\\s*';
  } else {
    let inlineMatches = regExes.INLINE_WILDCARD.exec(newRegExStr);
    if (inlineMatches) {
      let leftPart = '';
      let rightPart = newRegExStr;
      while (inlineMatches) {
        leftPart += rightPart.substring(0, inlineMatches.index + 1);
        if (inlineMatches[1] !== ')') {
          leftPart += '\\b';
        }
        leftPart += '\\s*(.*)\\s*';
        if ((inlineMatches[2] !== '(') && (inlineMatches[2] !== '\\')) {
          leftPart += '\\b';
        }
        leftPart += inlineMatches[2];
        rightPart = rightPart.substring(inlineMatches.index + inlineMatches[0].length);
        inlineMatches = regExes.INLINE_WILDCARD.exec(rightPart);
      }
      newRegExStr = leftPart + rightPart;
    }

    const startsMatches = regExes.STARTS_WITH_WILDCARD.exec(newRegExStr);
    if (startsMatches) {
      let patternTxt = '\\s*(.*)\\s*';
      if ((startsMatches[1] !== ')') && (startsMatches[1] !== '\\')) {
        patternTxt += '\\b';
      }
      newRegExStr = patternTxt + newRegExStr.substring(startsMatches.index - 1 + startsMatches[0].length);
    }

    const endsMatches = regExes.ENDS_WITH_WILDCARD.exec(newRegExStr);
    if (endsMatches) {
      let patternTxt = newRegExStr.substring(0, endsMatches.index + 1);
      if (endsMatches[1] !== '(') {
        patternTxt += '\\b';
      }
      newRegExStr = `${patternTxt}\\s*(.*)\\s*`;
    }
  }

  // expand white space
  newRegExStr = newRegExStr.replace(regExes.WHITESPACE, '\\s+');

  regExes.WHITESPACE.lastIndex = 0;
  return {
    regEx: newRegExStr,
    useMemFlag,
  };
}

module.exports = {
  init() {
    buildSynonymHash();
  },
  make,
};
