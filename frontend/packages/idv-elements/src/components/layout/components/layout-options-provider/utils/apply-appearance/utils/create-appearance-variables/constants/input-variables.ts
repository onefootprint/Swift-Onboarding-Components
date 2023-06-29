const inputVariables = new Map<
  string,
  { var: string; assignDefault?: string[] }
>([
  [
    'inputBorderRadius',
    {
      var: '--fp-base-inputs-border-radius',
    },
  ],
  [
    'inputBorderWidth',
    {
      var: '--fp-base-inputs-border-width',
    },
  ],
  [
    'inputFont',
    {
      var: '--fp-base-inputs-typography-default-input-content',
    },
  ],
  [
    'inputColor',
    {
      var: '--fp-base-inputs-focus-typing-input-content',
    },
  ],
  [
    'inputHeight',
    {
      var: '--fp-base-inputs-height-default',
    },
  ],
  [
    'inputPlaceholderColor',
    {
      var: '--fp-base-inputs-initial-placeholder',
    },
  ],
  [
    'inputBg',
    {
      var: '--fp-base-inputs-initial-bg',
      assignDefault: ['inputHoverBg'],
    },
  ],
  [
    'inputBorderColor',
    {
      var: '--fp-base-inputs-initial-border',
      assignDefault: ['inputHoverBorderColor'],
    },
  ],
  [
    'inputElevation',
    {
      var: '--fp-base-inputs-initial-elevation',
      assignDefault: ['inputHoverElevation', 'inputFocusElevation'],
    },
  ],
  [
    'inputHoverBg',
    {
      var: '--fp-base-inputs-hover-bg',
      assignDefault: ['inputFocusBg'],
    },
  ],
  [
    'inputHoverBorderColor',
    {
      var: '--fp-base-inputs-hover-border',
      assignDefault: ['inputFocusBorderColor'],
    },
  ],
  [
    'inputHoverElevation',
    {
      var: '--fp-base-inputs-hover-elevation',
    },
  ],
  [
    'inputFocusBg',
    {
      var: '--fp-base-inputs-focus-bg',
    },
  ],
  [
    'inputFocusBorderColor',
    {
      var: '--fp-base-inputs-focus-border',
    },
  ],
  [
    'inputFocusElevation',
    {
      var: '--fp-base-inputs-elevation-focus',
    },
  ],
  [
    'inputErrorBg',
    {
      var: '--fp-base-inputs-initial-error-bg',
      assignDefault: ['inputErrorHoverBg'],
    },
  ],
  [
    'inputErrorBorderColor',
    {
      var: '--fp-base-inputs-initial-error-border',
      assignDefault: ['inputErrorHoverBorderColor'],
    },
  ],
  [
    'inputErrorElevation',
    {
      var: '--fp-base-inputs-initial-error-elevation',
      assignDefault: ['inputErrorHoverElevation', 'inputErrorFocusElevation'],
    },
  ],
  [
    'inputErrorHoverBg',
    {
      var: '--fp-base-inputs-hover-error-bg',
      assignDefault: ['inputErrorFocusBg'],
    },
  ],
  [
    'inputErrorHoverBorderColor',
    {
      var: '--fp-base-inputs-hover-error-border',
    },
  ],
  [
    'inputErrorHoverElevation',
    {
      var: '--fp-base-inputs-hover-error-elevation',
    },
  ],
  [
    'inputErrorFocusBg',
    {
      var: '--fp-base-inputs-focus-error-bg',
    },
  ],
  [
    'inputErrorFocusBorderColor',
    {
      var: '--fp-base-inputs-focus-error-border',
    },
  ],
  [
    'inputErrorFocusElevation',
    {
      var: '--fp-base-inputs-elevation-focus-error',
    },
  ],
]);

export default inputVariables;
