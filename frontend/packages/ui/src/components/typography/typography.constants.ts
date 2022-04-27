type VariantMapping = {
  [key: string]: 'h1' | 'h2' | 'h3' | 'p' | 'div';
};

const variantMapping: VariantMapping = {
  'display-1': 'h1',
  'display-2': 'h2',
  'display-3': 'h3',
  'headline-1': 'h1',
  'headline-2': 'h2',
  'headline-3': 'h3',
  'body-1': 'p',
  'body-2': 'p',
  'body-3': 'p',
  'label-1': 'div',
  'label-2': 'div',
  'label-3': 'div',
  'label-4': 'div',
  'caption-1': 'div',
  'caption-2': 'div',
};

export default variantMapping;
