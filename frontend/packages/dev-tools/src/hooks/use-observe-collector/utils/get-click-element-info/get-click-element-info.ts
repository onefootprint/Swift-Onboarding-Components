import { take } from 'lodash';

import {
  DATA_PRIVATE_ATTRIBUTE,
  MAX_INNER_TEXT_LENGTH,
  MIN_INNER_TEXT_LENGTH,
  REDACTED_PRIVATE_DATA_VALUE,
  UNNAMED_ELEMENT_VALUE,
} from './get-click-element-info.constants';

type IClickElementInfo = {
  name: string;
  otherNames?: string[];
  tag?: string | null;
  role?: string | null;
  classList?: string[];
};

const getElementOrParentsHavePrivateData = (el: HTMLElement) => {
  // True if element or any of its parents have the DATA_PRIVATE_ATTRIBUTE set.
  let currentElement = el.parentElement;
  let hasPrivateData = !!el.getAttribute(DATA_PRIVATE_ATTRIBUTE);

  while (
    currentElement &&
    currentElement.tagName !== 'BODY' &&
    !hasPrivateData
  ) {
    currentElement = currentElement.parentElement;
    hasPrivateData = !!currentElement?.getAttribute(DATA_PRIVATE_ATTRIBUTE);
  }

  return hasPrivateData;
};

export const getClickedElementContextInPage = (
  el: HTMLElement,
): IClickElementInfo[] => {
  let allParents: HTMLElement[] = [];
  let currentElement: HTMLElement | null = el;
  while (currentElement && currentElement.tagName !== 'BODY') {
    allParents.push(currentElement);
    currentElement = currentElement.parentElement;
  }
  allParents = allParents.reverse(); // The topmost elements come first
  const privateDataParentIndex = allParents.findIndex(parentEl =>
    parentEl.getAttribute(DATA_PRIVATE_ATTRIBUTE),
  );
  // If any of the parents contain private data, delete anything downstream
  if (privateDataParentIndex > -1) {
    allParents.splice(privateDataParentIndex + 1);
  }

  // Now traverse any parents looking for significant "things", like header markups or aria labels
  const contexts: IClickElementInfo[] = [];
  allParents.forEach(parentEl => {
    const ariaLabel = parentEl.getAttribute('aria-label');
    const role = parentEl.getAttribute('role');
    const texts = [ariaLabel, role].filter(elem => !!elem) as string[];
    if (texts.length) {
      const info = getClickedElementDetails(texts, parentEl);
      contexts.push(info);
    }
  });
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
  const texts = [el.getAttribute('aria-label')];
  if (el.tagName.toLowerCase() === 'img') {
    texts.push(el.getAttribute('alt'));
  }
  // fish around looking for clear semantic labels, like "headers"
  const hasPrivateData = getElementOrParentsHavePrivateData(el);
  if (hasPrivateData) {
    texts.push(REDACTED_PRIVATE_DATA_VALUE);
  } else {
    texts.push(...findInclusiveDownstreamElementsTexts(el));
  }

  return getClickedElementDetails(texts, el);
};

const MAX_DOWNSTREAM_TEXTS_TO_LOG = 3;

const findInclusiveDownstreamElementsTexts = (
  parent: HTMLElement,
): string[] => {
  const elems: HTMLElement[] = [parent];
  const children = Array.from(parent.querySelectorAll('*')) as HTMLElement[];
  elems.push(...children);

  const privateDataElemIndex = elems.findIndex(el =>
    el.getAttribute(DATA_PRIVATE_ATTRIBUTE),
  );

  // If any of the elems contain private data, delete anything downstream
  if (privateDataElemIndex > -1) {
    elems.splice(privateDataElemIndex + 1);
  }

  // Find the texts from the elements collected, only log them if they don't contain private data.
  const texts: string[] = [];
  elems.forEach(el => {
    texts.push(...getElementTextsWithoutPrivateData(el));
  });

  const filteredTexts = texts.filter(text => !!text?.length);

  // Don't log too many texts
  return take(filteredTexts, MAX_DOWNSTREAM_TEXTS_TO_LOG);
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
