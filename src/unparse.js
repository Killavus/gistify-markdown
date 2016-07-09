const LIST_INDENT_SPACES = 2;
const BLOCKQUOTE_PREFIX = '> ';
const HEADER_PREFIX_COMPOUND = '#';
const UNORDERED_LIST_ELEMENT_STARTED_PREFIX = '* ';
const ORDERED_LIST_ELEMENT_STARTED_PREFIX = '1. ';
const UNORDERED_LIST_INDENT = '  ';
const ORDERED_LIST_INDENT = '   ';
const SEP = "\n\n";
const MODIFIED_SEP = "\n";

const BLOCKQUOTE = 'BLOCKQUOTE';
const ORDERED_LIST = 'ORDERED_LIST';
const UNORDERED_LIST = 'UNORDERED_LIST';
const ORDERED_LIST_ELEMENT_STARTED = 'ORDERED_LIST_ELEMENT_STARTED';
const UNORDERED_LIST_ELEMENT_STARTED = 'UNORDERED_LIST_ELEMENT_STARTED';

const chooseSep = modifiers => {
  if (modifiers.length > 0) {
    return MODIFIED_SEP;
  }
  else {
    return SEP;
  }
}

const condType = (lexem, typesCond) => {
  return typeof typesCond[lexem.type] === 'function' ?
           typesCond[lexem.type](lexem) :
           typesCond.unknown(lexem);
};

const makeRange = count => {
  const result = [];
  for(let index = 0; index < count; ++index) {
    result.push(index);
  }

  return result;
};

const last = arr => {
  return arr[arr.length - 1];
};

const dropLast = (arr, n) => {
  return arr.slice(0, -n);
}

const prepareModifiers = ({ modifiers }) => {
  if ([ORDERED_LIST_ELEMENT_STARTED,
       UNORDERED_LIST_ELEMENT_STARTED].indexOf(last(modifiers)) !== -1) {
    return { current: [...dropLast(modifiers, 2), last(modifiers)],
             next: dropLast(modifiers, 1) };
  }
  else {
    return { current: modifiers, next: modifiers };
  }
};

const modifierPrefix = modifiers => {
  return modifiers.reduce((prefix, modifier) => {
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

    throw new Error(`Undefined modifier: ${modifier}`)
  }, '');
};

const unparseParagraph = context => lexem => {
  const { text } = lexem;
  const { result } = context;
  const { next, current } = prepareModifiers(context);

  return Object.assign({}, context, { result: result +
                                              modifierPrefix(current) +
                                              text +
                                              chooseSep(current),
                                      modifiers: next });
};

const unparseText = unparseParagraph;

const unparseBlockquoteStart = context => lexem => {
  const { next } = prepareModifiers(context);
  const modifiers = [...next, BLOCKQUOTE];
  return Object.assign({}, context, { modifiers });
};

const unparseBlockquoteEnd = context => lexem => {
  const lastModifier = last(context.modifiers);

  if (lastModifier === undefined) {
    throw new Error('Encountered blockquote end but no modifiers on stack.');
  }

  if (lastModifier !== BLOCKQUOTE) {
    throw new Error('Encountered blockquote end but last modifier is not blockquote modifier.');
  }

  const { next } = prepareModifiers(context);
  const modifiers = dropLast(next, 1);
  return Object.assign({}, context, { modifiers, result: context.result + MODIFIED_SEP });
};

const unparseHeading = context => lexem => {
  const { text, depth } = lexem;
  const { result } = context;
  const { next, current } = prepareModifiers(context);

  const prefix = makeRange(depth).fill(HEADER_PREFIX_COMPOUND).join() + " ";

  return Object.assign({}, context, { result: result +
                                              modifierPrefix(current) +
                                              prefix +
                                              text +
                                              chooseSep(current),
                                      modifiers: next });
};

const unparseListStart = context => lexem => {
  const { ordered } = lexem;
  const { next } = prepareModifiers(context);
  let modifiers = next;

  if (ordered) {
    modifiers = [...modifiers, ORDERED_LIST];
  } else {
    modifiers = [...modifiers, UNORDERED_LIST];
  }

  return Object.assign({}, context, { modifiers });
};

const unparseListEnd = context => lexem => {
  const { next } = prepareModifiers(context);
  const lastModifier = last(next);

  if (lastModifier === undefined) {
    throw new Error('Encountered list end but no modifiers on stack.');
  }

  if (lastModifier !== ORDERED_LIST && lastModifier !== UNORDERED_LIST) {
    throw new Error('Encountered list end but last modifier is not list modifier.');
  }

  const modifiers = dropLast(next, 1);

  return Object.assign({}, context, { result: context.result + MODIFIED_SEP, modifiers });
};

const unparseListItemStart = context => lexem => {
  const { next } = prepareModifiers(context);
  const lastModifier = last(next);

  if ([ORDERED_LIST, UNORDERED_LIST].indexOf(lastModifier) === -1) {
    throw new Error('New list element start, but not list on modifiers stack.');
  }

  const listStartModifier = {
    [ORDERED_LIST]: ORDERED_LIST_ELEMENT_STARTED,
    [UNORDERED_LIST]: UNORDERED_LIST_ELEMENT_STARTED
  }[lastModifier];

  const modifiers = [...next, listStartModifier];

  return Object.assign({}, context, { modifiers });
};

const unparseLexems = lexems => {
  return lexems.reduce((context, lexem) => {
    return condType(lexem, {
      paragraph: unparseParagraph(context),
      blockquote_start: unparseBlockquoteStart(context),
      blockquote_end: unparseBlockquoteEnd(context),
      list_start: unparseListStart(context),
      list_end: unparseListEnd(context),
      list_item_start: unparseListItemStart(context),
      heading: unparseHeading(context),
      text: unparseText(context),
      unknown: lexem => context
    });
  }, { modifiers: [], result: "" }).result;
};

export default unparseLexems;
