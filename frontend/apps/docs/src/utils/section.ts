import kebabCase from 'lodash/kebabCase';

/**
 * Extract the annotated section ID from the markdown string.
 * We add this annotated section ID in order to generate unique IDs for each section.
 */
const getSectionId = (section: string) => {
  const idRegex = /\[\[id=([A-Za-z0-9-]+)\]\]/g;
  if (section.match(idRegex)) {
    return section.split('[[id=')[1].split(']]')[0];
  }
  const label = section.split('#').join('').trim();
  return kebabCase(label);
};

const getSectionMeta = (input: string | string[]) => {
  const text = Array.isArray(input) ? input.join('') : input;
  const level = text.split('#').length - 1;
  const label = text.split('#').join('').split('[[id=')[0].trim();
  const id = getSectionId(text);
  const anchor = `#${id}`;
  return { label, level, anchor, id };
};

export default getSectionMeta;
