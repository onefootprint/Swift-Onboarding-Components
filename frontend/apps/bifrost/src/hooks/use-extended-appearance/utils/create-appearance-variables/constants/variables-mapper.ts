const jsToCssVariables = new Map<
  string,
  { var: string; assignDefault?: string[] }
>([
  [
    'borderRadius',
    {
      var: '--fp-border-radius-default',
      assignDefault: ['buttonBorderRadius', 'dialogBorderRadius'],
    },
  ],
  [
    'colorError',
    {
      var: '--fp-semantic-text-info',
      assignDefault: [
        'linkButtonDestructiveColor',
        'linkButtonDestructiveHoverColor',
        'linkButtonDestructiveActiveColor',
      ],
    },
  ],
  [
    'colorWarning',
    {
      var: '--fp-semantic-text-info',
      assignDefault: [],
    },
  ],
  [
    'colorSuccess',
    {
      var: '--fp-semantic-text-info',
      assignDefault: [],
    },
  ],
  [
    'colorAccent',
    {
      var: '--fp-semantic-text-info',
      assignDefault: [
        'linkColor',
        'linkButtonColor',
        'linkButtonHoverColor',
        'linkButtonActiveColor',
      ],
    },
  ],
  [
    'linkColor',
    {
      var: '--fp-link-color',
      assignDefault: [],
    },
  ],
  [
    'dialogBg',
    {
      var: '--fp-bifrost-dialog-body-bg-primary',
    },
  ],
  [
    'dialogBoxShadow',
    {
      var: '--fp-bifrost-dialog-elevation',
    },
  ],
  [
    'dialogBorderRadius',
    {
      var: '--fp-bifrost-dialog-border-radius',
    },
  ],
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

  [
    'linkButtonColor',
    {
      var: '--fp-link-button-default-initial-text',
      assignDefault: ['linkButtonHoverColor', 'linkButtonActiveColor'],
    },
  ],
  [
    'linkButtonHoverColor',
    {
      var: '--fp-link-button-default-hover-text',
    },
  ],
  [
    'linkButtonActiveColor',
    {
      var: '--fp-link-button-default-active-text',
    },
  ],
  [
    'linkButtonDestructiveColor',
    {
      var: '--fp-link-button-destructive-initial-text',
      assignDefault: [
        'linkButtonDestructiveHoverColor',
        'linkButtonDestructiveActiveColor',
      ],
    },
  ],
  [
    'linkButtonDestructiveHoverColor',
    {
      var: '--fp-link-button-destructive-hover-text',
    },
  ],
  [
    'linkButtonDestructiveActiveColor',
    {
      var: '--fp-link-button-destructive-active-text',
    },
  ],
]);

export default jsToCssVariables;
