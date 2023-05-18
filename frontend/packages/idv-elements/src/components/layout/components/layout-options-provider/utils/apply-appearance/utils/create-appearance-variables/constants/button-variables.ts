const buttonVariables = new Map<
  string,
  { var: string; assignDefault?: string[] }
>([
  [
    'buttonBorderRadius',
    {
      var: '--fp-buttons-border-radius',
    },
  ],
  [
    'buttonBorderWidth',
    {
      var: '--fp-button-border-width',
    },
  ],
  [
    'buttonPrimaryBg',
    {
      var: '--fp-buttons-primary-initial-bg',
      assignDefault: ['buttonPrimaryHoverBg', 'buttonPrimaryActiveBg'],
    },
  ],
  [
    'buttonPrimaryColor',
    {
      var: '--fp-buttons-primary-initial-text',
      assignDefault: ['buttonPrimaryHoverColor', 'buttonPrimaryActiveColor'],
    },
  ],
  [
    'buttonPrimaryBorderColor',
    {
      var: '--fp-buttons-primary-initial-border',
    },
  ],
  [
    'buttonPrimaryHoverBg',
    {
      var: '--fp-buttons-primary-hover-bg',
    },
  ],
  [
    'buttonPrimaryHoverColor',
    {
      var: '--fp-buttons-primary-hover-text',
    },
  ],
  [
    'buttonPrimaryHoverBorderColor',
    {
      var: '--fp-buttons-primary-hover-border',
    },
  ],
  [
    'buttonPrimaryActiveBg',
    {
      var: '--fp-buttons-primary-active-bg',
    },
  ],
  [
    'buttonPrimaryActiveColor',
    {
      var: '--fp-buttons-primary-active-text',
    },
  ],
  [
    'buttonPrimaryActiveBorderColor',
    {
      var: '--fp-buttons-primary-active-border',
    },
  ],
  [
    'buttonPrimaryDisabledBg',
    {
      var: 'fp-buttons-primary-disabled-bg',
    },
  ],
  [
    'buttonPrimaryDisabledColor',
    {
      var: 'fp-buttons-primary-disabled-text',
    },
  ],
  [
    'buttonPrimaryDisabledBorderColor',
    {
      var: 'fp-buttons-primary-disabled-border',
    },
  ],
  [
    'buttonPrimaryLoadingBg',
    {
      var: 'fp-buttons-primary-loading-bg',
    },
  ],
  [
    'buttonPrimaryLoadingColor',
    {
      var: 'fp-buttons-primary-loading-bg',
    },
  ],
  [
    'buttonsPrimaryLoadingBorderColor',
    {
      var: 'fp-buttons-primary-loading-border',
    },
  ],
  [
    'buttonSecondaryBg',
    {
      var: '--fp-buttons-secondary-initial-bg',
      assignDefault: ['buttonSecondaryHoverBg', 'buttonSecondaryActiveBg'],
    },
  ],
  [
    'buttonSecondaryColor',
    {
      var: '--fp-buttons-secondary-initial-text',
      assignDefault: [
        'buttonSecondaryHoverColor',
        'buttonSecondaryActiveColor',
      ],
    },
  ],
  [
    'buttonSecondaryBorderColor',
    {
      var: '--fp-buttons-secondary-initial-border',
    },
  ],
  [
    'buttonSecondaryHoverBg',
    {
      var: '--fp-buttons-secondary-hover-bg',
    },
  ],
  [
    'buttonSecondaryHoverColor',
    {
      var: '--fp-buttons-secondary-hover-text',
    },
  ],
  [
    'buttonSecondaryHoverBorderColor',
    {
      var: '--fp-buttons-secondary-hover-border',
    },
  ],
  [
    'buttonSecondaryActiveBg',
    {
      var: '--fp-buttons-secondary-active-bg',
    },
  ],
  [
    'buttonSecondaryActiveColor',
    {
      var: '--fp-buttons-secondary-active-text',
    },
  ],
  [
    'buttonSecondaryActiveBorderColor',
    {
      var: '--fp-buttons-secondary-active-border',
    },
  ],
  [
    'buttonSecondaryDisabledBg',
    {
      var: 'fp-buttons-secondary-disabled-bg',
    },
  ],
  [
    'buttonSecondaryDisabledColor',
    {
      var: 'fp-buttons-secondary-disabled-text',
    },
  ],
  [
    'buttonSecondaryDisabledBorderColor',
    {
      var: 'fp-buttons-secondary-disabled-border',
    },
  ],
  [
    'buttonSecondaryLoadingBg',
    {
      var: 'fp-buttons-secondary-loading-bg',
    },
  ],
  [
    'buttonSecondaryLoadingColor',
    {
      var: 'fp-buttons-secondary-loading-bg',
    },
  ],
]);

export default buttonVariables;
