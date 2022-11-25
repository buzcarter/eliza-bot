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

/**
 * @example
 * const value = '* i * you *';
 * const result = inlineWildcards(value);
 * // result is: '* i\\b\\s*(.*)\\s*\\byou *'
 */
function inlineWildcards(regEx) {
  if (!regExes.INLINE_WILDCARD.test(regEx)) {
    return regEx;
  }

  const globalRegEx = new RegExp(regExes.INLINE_WILDCARD, 'g');
  return regEx.replace(globalRegEx, (phrase) => {
    const [, firstChar, lastChar] = phrase.match(regExes.INLINE_WILDCARD);
    const firstBoundary = firstChar !== ')' ? RegExStr.BOUNDARY : '';
    const lastBoundary = ((lastChar !== '(') && (lastChar !== '\\')) ? RegExStr.BOUNDARY : '';

    return `${firstChar}${firstBoundary}${RegExStr.WILDCARD}${lastBoundary}${lastChar}`;
  });
}

function startsWithWildcard(regEx) {
  // TODO: legacy meaning of "if ((matches[1] !== ')') && (matches[1] !== '\\')) {"
  return regExes.STARTS_WITH_WILDCARD.test(regEx)
    ? regEx.replace(regExes.STARTS_WITH_WILDCARD, `${RegExStr.WILDCARD}${RegExStr.BOUNDARY}$1`)
    : regEx;
}

const expandWhitespace = (regEx) => regEx.replace(regExes.WHITESPACE, '\\s+');

function expandSynonyms(regEx) {
  return regExes.USE_SYNONYM.test(regEx)
    ? regEx.replace(regExes.USE_SYNONYM, (match, word) => synPatternHash[word] || word)
    : regEx;
}

function make(pattern) {
  let regEx = `${pattern || ''}`;

  if (regExes.WILDCARD.test(regEx)) {
    return RegExStr.WILDCARD;
  }

  regEx = expandSynonyms(regEx);
  regEx = inlineWildcards(regEx);
  regEx = startsWithWildcard(regEx);
  regEx = endsWithWildcard(regEx);
  regEx = expandWhitespace(regEx);

  return regEx;
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
