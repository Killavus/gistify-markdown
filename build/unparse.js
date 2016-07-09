'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var LIST_INDENT_SPACES = 2;
var BLOCKQUOTE_PREFIX = '> ';
var HEADER_PREFIX_COMPOUND = '#';
var UNORDERED_LIST_ELEMENT_STARTED_PREFIX = '* ';
var ORDERED_LIST_ELEMENT_STARTED_PREFIX = '1. ';
var UNORDERED_LIST_INDENT = '  ';
var ORDERED_LIST_INDENT = '   ';
var SEP = "\n\n";
var MODIFIED_SEP = "\n";

var BLOCKQUOTE = 'BLOCKQUOTE';
var ORDERED_LIST = 'ORDERED_LIST';
var UNORDERED_LIST = 'UNORDERED_LIST';
var ORDERED_LIST_ELEMENT_STARTED = 'ORDERED_LIST_ELEMENT_STARTED';
var UNORDERED_LIST_ELEMENT_STARTED = 'UNORDERED_LIST_ELEMENT_STARTED';

var chooseSep = function chooseSep(modifiers) {
  if (modifiers.length > 0) {
    return MODIFIED_SEP;
  } else {
    return SEP;
  }
};

var condType = function condType(lexem, typesCond) {
  return typeof typesCond[lexem.type] === 'function' ? typesCond[lexem.type](lexem) : typesCond.unknown(lexem);
};

var makeRange = function makeRange(count) {
  var result = [];
  for (var index = 0; index < count; ++index) {
    result.push(index);
  }

  return result;
};

var last = function last(arr) {
  return arr[arr.length - 1];
};

var dropLast = function dropLast(arr, n) {
  return arr.slice(0, -n);
};

var prepareModifiers = function prepareModifiers(_ref) {
  var modifiers = _ref.modifiers;

  if ([ORDERED_LIST_ELEMENT_STARTED, UNORDERED_LIST_ELEMENT_STARTED].indexOf(last(modifiers)) !== -1) {
    return { current: [].concat(_toConsumableArray(dropLast(modifiers, 2)), [last(modifiers)]),
      next: dropLast(modifiers, 1) };
  } else {
    return { current: modifiers, next: modifiers };
  }
};

var modifierPrefix = function modifierPrefix(modifiers) {
  return modifiers.reduce(function (prefix, modifier) {
    if (modifier === BLOCKQUOTE) {
      return prefix + BLOCKQUOTE_PREFIX;
    }

    if (modifier === ORDERED_LIST_ELEMENT_STARTED) {
      return prefix + ORDERED_LIST_ELEMENT_STARTED_PREFIX;
    }

    if (modifier === UNORDERED_LIST_ELEMENT_STARTED) {
      return prefix + UNORDERED_LIST_ELEMENT_STARTED_PREFIX;
    }

    if (modifier === ORDERED_LIST) {
      return prefix + ORDERED_LIST_INDENT;
    }

    if (modifier === UNORDERED_LIST) {
      return prefix + UNORDERED_LIST_INDENT;
    }

    throw new Error('Undefined modifier: ' + modifier);
  }, '');
};

var unparseParagraph = function unparseParagraph(context) {
  return function (lexem) {
    var text = lexem.text;
    var result = context.result;

    var _prepareModifiers = prepareModifiers(context);

    var next = _prepareModifiers.next;
    var current = _prepareModifiers.current;


    return Object.assign({}, context, { result: result + modifierPrefix(current) + text + chooseSep(current),
      modifiers: next });
  };
};

var unparseText = unparseParagraph;

var unparseBlockquoteStart = function unparseBlockquoteStart(context) {
  return function (lexem) {
    var _prepareModifiers2 = prepareModifiers(context);

    var next = _prepareModifiers2.next;

    var modifiers = [].concat(_toConsumableArray(next), [BLOCKQUOTE]);
    return Object.assign({}, context, { modifiers: modifiers });
  };
};

var unparseBlockquoteEnd = function unparseBlockquoteEnd(context) {
  return function (lexem) {
    var lastModifier = last(context.modifiers);

    if (lastModifier === undefined) {
      throw new Error('Encountered blockquote end but no modifiers on stack.');
    }

    if (lastModifier !== BLOCKQUOTE) {
      throw new Error('Encountered blockquote end but last modifier is not blockquote modifier.');
    }

    var _prepareModifiers3 = prepareModifiers(context);

    var next = _prepareModifiers3.next;

    var modifiers = dropLast(next, 1);
    return Object.assign({}, context, { modifiers: modifiers, result: context.result + MODIFIED_SEP });
  };
};

var unparseHeading = function unparseHeading(context) {
  return function (lexem) {
    var text = lexem.text;
    var depth = lexem.depth;
    var result = context.result;

    var _prepareModifiers4 = prepareModifiers(context);

    var next = _prepareModifiers4.next;
    var current = _prepareModifiers4.current;


    var prefix = makeRange(depth).fill(HEADER_PREFIX_COMPOUND).join() + " ";

    return Object.assign({}, context, { result: result + modifierPrefix(current) + prefix + text + chooseSep(current),
      modifiers: next });
  };
};

var unparseListStart = function unparseListStart(context) {
  return function (lexem) {
    var ordered = lexem.ordered;

    var _prepareModifiers5 = prepareModifiers(context);

    var next = _prepareModifiers5.next;

    var modifiers = next;

    if (ordered) {
      modifiers = [].concat(_toConsumableArray(modifiers), [ORDERED_LIST]);
    } else {
      modifiers = [].concat(_toConsumableArray(modifiers), [UNORDERED_LIST]);
    }

    return Object.assign({}, context, { modifiers: modifiers });
  };
};

var unparseListEnd = function unparseListEnd(context) {
  return function (lexem) {
    var _prepareModifiers6 = prepareModifiers(context);

    var next = _prepareModifiers6.next;

    var lastModifier = last(next);

    if (lastModifier === undefined) {
      throw new Error('Encountered list end but no modifiers on stack.');
    }

    if (lastModifier !== ORDERED_LIST && lastModifier !== UNORDERED_LIST) {
      throw new Error('Encountered list end but last modifier is not list modifier.');
    }

    var modifiers = dropLast(next, 1);

    return Object.assign({}, context, { result: context.result + MODIFIED_SEP, modifiers: modifiers });
  };
};

var unparseListItemStart = function unparseListItemStart(context) {
  return function (lexem) {
    var _ORDERED_LIST$UNORDER;

    var _prepareModifiers7 = prepareModifiers(context);

    var next = _prepareModifiers7.next;

    var lastModifier = last(next);

    if ([ORDERED_LIST, UNORDERED_LIST].indexOf(lastModifier) === -1) {
      throw new Error('New list element start, but not list on modifiers stack.');
    }

    var listStartModifier = (_ORDERED_LIST$UNORDER = {}, _defineProperty(_ORDERED_LIST$UNORDER, ORDERED_LIST, ORDERED_LIST_ELEMENT_STARTED), _defineProperty(_ORDERED_LIST$UNORDER, UNORDERED_LIST, UNORDERED_LIST_ELEMENT_STARTED), _ORDERED_LIST$UNORDER)[lastModifier];

    var modifiers = [].concat(_toConsumableArray(next), [listStartModifier]);

    return Object.assign({}, context, { modifiers: modifiers });
  };
};

var unparseLexems = function unparseLexems(lexems) {
  return lexems.reduce(function (context, lexem) {
    return condType(lexem, {
      paragraph: unparseParagraph(context),
      blockquote_start: unparseBlockquoteStart(context),
      blockquote_end: unparseBlockquoteEnd(context),
      list_start: unparseListStart(context),
      list_end: unparseListEnd(context),
      list_item_start: unparseListItemStart(context),
      heading: unparseHeading(context),
      text: unparseText(context),
      unknown: function unknown(lexem) {
        return context;
      }
    });
  }, { modifiers: [], result: "" }).result;
};

exports.default = unparseLexems;