import {
  DATA_PRIVATE_ATTRIBUTE,
  MAX_INNER_TEXT_LENGTH,
  MIN_INNER_TEXT_LENGTH,
  REDACTED_PRIVATE_DATA_VALUE,
  TITLE_ELEMENT_TAG_NAMES,
  UNNAMED_ELEMENT_VALUE,
} from './get-click-element-info.constants';

type IClickElementInfo = {
  name: string;
  otherNames?: string[];
  tag?: string | null;
  role?: string | null;
  classList?: string[];
};

export const getClickedElementContextInPage = (
  el: HTMLElement,
): IClickElementInfo[] => {
  // traverse the DOM tree looking for significant "things", like header markups or aria labels
  const contexts: IClickElementInfo[] = [];
  let currentElement = el.parentElement;
  while (currentElement && currentElement.tagName !== 'BODY') {
    const ariaLabel = currentElement.getAttribute('aria-label');
    const role = currentElement.getAttribute('role');
    const texts = [ariaLabel, role].filter(elem => !!elem) as string[];
    if (texts.length) {
      const info = getClickedElementDetails(texts, currentElement);
      contexts.push(info);
    }
    currentElement = currentElement.parentElement;
  }
  return contexts;
};

function getClickedElementDetails(
  texts: (null | undefined | string)[],
  el: HTMLElement,
): IClickElementInfo {
  const modifiedTexts = Array.from(new Set(texts)).filter(
    text => !!text?.length,
  ) as string[];
  return {
    name: modifiedTexts.length ? modifiedTexts[0] : UNNAMED_ELEMENT_VALUE,
    otherNames: modifiedTexts.length ? modifiedTexts.slice(1) : [],
    tag: el.tagName ?? null,
    role: el.getAttribute('role') ?? null,
    classList: (el.getAttribute('class') || '')
      .split(' ')
      .filter((c: string) => c && c.length),
  };
}

const getElementTextsWithoutPrivateData = (el: HTMLElement): string[] => {
  const texts: string[] = [];
  const isPrivateData = el.getAttribute(DATA_PRIVATE_ATTRIBUTE);
  if (isPrivateData) {
    texts.push(REDACTED_PRIVATE_DATA_VALUE);
    return texts;
  }

  const value = tidyElementValue((el as HTMLInputElement).value);
  if (value) {
    texts.push(value);
  }
  const innerText = tidyElementValue(el.innerText);
  if (innerText) {
    texts.push(innerText);
  }

  return texts;
};

export const getClickedElementInfo = (el: HTMLElement) => {
  let texts = [el.getAttribute('aria-label')];
  if (el.tagName.toLowerCase() === 'img') {
    texts.push(el.getAttribute('alt'));
    texts.push(el.getAttribute('src'));
  }
  // fish around looking for clear semantic labels, like "headers"
  if (el.childElementCount) {
    texts.push(findChildrenElementsTexts(el));
  }
  texts.push(...getElementTextsWithoutPrivateData(el));
  // Get rid of dupes
  texts = Array.from(new Set(texts)).filter(text => !!text?.length) as string[];

  return getClickedElementDetails(texts, el);
};

const findChildrenElementsTexts = (parent: HTMLElement): string | null => {
  const fontEls: { size: number; el: HTMLElement }[] = [];
  const children = Array.from(parent.querySelectorAll('*')) as HTMLElement[];

  // look through all of the items looking for the biggest font!
  children.forEach(el => {
    // get elements with font size
    const style = getComputedStyle(el);
    if (style.fontSize && style.fontSize.endsWith('px')) {
      // This only supports px for now
      const size = Number.parseInt(
        style.fontSize.substring(0, style.fontSize.length - 2),
        10,
      );
      fontEls.push({
        size,
        el,
      });
    }
  });

  // sort by size, prefer nodes with no children
  fontEls.sort((a: any, b: any) => {
    if (a.size === b.size) {
      return a.el.childElementCount - b.el.childElementCount;
    }
    return b.size - a.size;
  });

  // Find the texts from the elements collected, only log them if they don't contain private data.
  const fontElsTexts: string[] = [];
  fontEls.forEach(({ el }) => {
    fontElsTexts.push(...getElementTextsWithoutPrivateData(el));
  });
  const filteredTexts = fontElsTexts.filter(text => !!text?.length) as string[];

  if (filteredTexts.length) {
    return filteredTexts[0];
  }

  // if we have nothing with any font size then just look through common title elements
  const textContents = TITLE_ELEMENT_TAG_NAMES.map(
    tag => parent.querySelector(tag)?.textContent,
  ).filter(text => !!text?.length) as string[];

  if (textContents.length) {
    return textContents[0];
  }

  return null;
};

function tidyElementValue(value: string): string | null {
  if (!value) {
    return null;
  }
  let text = value;
  if (text.length > MAX_INNER_TEXT_LENGTH) {
    text = value.substring(0, MAX_INNER_TEXT_LENGTH);
  }
  const newLineBoundary = text.indexOf('\n');
  if (newLineBoundary < 0) {
    return text;
  }
  if (newLineBoundary > MIN_INNER_TEXT_LENGTH) {
    return text.substring(0, newLineBoundary);
  }
  return null;
}
