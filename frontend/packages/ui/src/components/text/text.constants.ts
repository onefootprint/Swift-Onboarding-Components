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
  'label-1': 'p',
  'label-2': 'p',
  'label-3': 'p',
  'caption-1': 'p',
  'caption-2': 'p',
};

export default variantMapping;
