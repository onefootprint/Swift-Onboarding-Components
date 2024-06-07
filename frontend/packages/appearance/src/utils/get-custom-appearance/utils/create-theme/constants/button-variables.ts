export default new Map<string, { var: string; assignDefault?: string[] }>([
  [
    'buttonBorderRadius',
    {
      var: 'components.button.borderRadius',
    },
  ],
  [
    'buttonBorderWidth',
    {
      var: 'components.button.borderWidth',
    },
  ],
  [
    'buttonPrimaryBg',
    {
      var: 'components.button.variant.primary.bg',
      assignDefault: ['buttonPrimaryHoverBg', 'buttonPrimaryActiveBg', 'buttonPrimaryLoadingBg'],
    },
  ],
  [
    'buttonPrimaryColor',
    {
      var: 'components.button.variant.primary.color',
      assignDefault: ['buttonPrimaryHoverColor', 'buttonPrimaryActiveColor', 'buttonPrimaryLoadingColor'],
    },
  ],
  [
    'buttonPrimaryBorderColor',
    {
      var: 'components.button.variant.primary.borderColor',
      assignDefault: [
        'buttonPrimaryHoverBorderColor',
        'buttonPrimaryActiveBorderColor',
        'buttonsPrimaryLoadingBorderColor',
      ],
    },
  ],
  [
    'buttonPrimaryHoverBg',
    {
      var: 'components.button.variant.primary.hover.bg',
    },
  ],
  ['buttonPrimaryHoverColor', { var: 'components.button.variant.primary.hover.color' }],
  ['buttonPrimaryHoverBorderColor', { var: 'components.button.variant.primary.hover.borderColor' }],
  [
    'buttonPrimaryActiveBg',
    {
      var: 'components.button.variant.primary.active.bg',
    },
  ],
  [
    'buttonPrimaryActiveColor',
    {
      var: 'components.button.variant.primary.active.color',
    },
  ],
  [
    'buttonPrimaryActiveBorderColor',
    {
      var: 'components.button.variant.primary.active.borderColor',
    },
  ],
  [
    'buttonPrimaryDisabledBg',
    {
      var: 'components.button.variant.primary.disabled.bg',
    },
  ],
  [
    'buttonPrimaryDisabledColor',
    {
      var: 'components.button.variant.primary.disabled.color',
    },
  ],
  [
    'buttonPrimaryDisabledBorderColor',
    {
      var: 'components.button.variant.primary.disabled.borderColor',
    },
  ],
  [
    'buttonPrimaryLoadingBg',
    {
      var: 'components.button.variant.primary.loading.bg',
    },
  ],
  [
    'buttonPrimaryLoadingColor',
    {
      var: 'components.button.variant.primary.loading.color',
    },
  ],
  [
    'buttonsPrimaryLoadingBorderColor',
    {
      var: 'components.button.variant.primary.loading.borderColor',
    },
  ],
  [
    'buttonSecondaryBg',
    {
      var: 'components.button.variant.secondary.bg',
      assignDefault: ['buttonSecondaryActiveBg'],
    },
  ],
  [
    'buttonSecondaryColor',
    {
      var: 'components.button.variant.secondary.color',
      assignDefault: ['buttonSecondaryActiveColor'],
    },
  ],
  [
    'buttonSecondaryBorderColor',
    {
      var: 'components.button.variant.secondary.borderColor',
    },
  ],
  [
    'buttonSecondaryHoverBg',
    {
      var: 'components.button.variant.secondary.hover.bg',
    },
  ],
  [
    'buttonSecondaryHoverColor',
    {
      var: 'components.button.variant.secondary.hover.color',
    },
  ],
  [
    'buttonSecondaryHoverBorderColor',
    {
      var: 'components.button.variant.secondary.hover.borderColor',
    },
  ],
  [
    'buttonSecondaryActiveBg',
    {
      var: 'components.button.variant.secondary.active.bg',
    },
  ],
  [
    'buttonSecondaryActiveColor',
    {
      var: 'components.button.variant.secondary.active.color',
    },
  ],
  [
    'buttonSecondaryActiveBorderColor',
    {
      var: 'components.button.variant.secondary.active.borderColor',
    },
  ],
  [
    'buttonSecondaryDisabledBg',
    {
      var: 'components.button.variant.secondary.disabled.bg',
    },
  ],
  [
    'buttonSecondaryDisabledColor',
    {
      var: 'components.button.variant.secondary.disabled.color',
    },
  ],
  [
    'buttonSecondaryDisabledBorderColor',
    {
      var: 'components.button.variant.secondary.disabled.borderColor',
    },
  ],
  [
    'buttonSecondaryLoadingBg',
    {
      var: 'components.button.variant.secondary.loading.bg',
    },
  ],
  [
    'buttonSecondaryLoadingColor',
    {
      var: 'components.button.variant.secondary.loading.Color',
    },
  ],
  [
    'buttonsSecondaryLoadingBorderColor',
    {
      var: 'components.button.variant.primary.loading.borderColor',
    },
  ],
]);
