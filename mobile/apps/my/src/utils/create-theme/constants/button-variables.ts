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
      assignDefault: ['buttonPrimaryActiveBg', 'buttonPrimaryLoadingBg', 'buttonPrimaryDisabledBg'],
    },
  ],
  [
    'buttonPrimaryColor',
    {
      var: 'components.button.variant.primary.color',
      assignDefault: ['buttonPrimaryActiveColor'],
    },
  ],
  [
    'buttonPrimaryBorderColor',
    {
      var: 'components.button.variant.primary.borderColor',
    },
  ],
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
      assignDefault: ['buttonSecondaryActiveBg', 'buttonSecondaryLoadingBg', 'buttonSecondaryDisabledBg'],
    },
  ],
  [
    'buttonSecondaryBorderColor',
    {
      var: 'components.button.variant.secondary.borderColor',
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
      assignDefault: ['buttonPrimaryLoadingBg'],
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
