export default new Map<string, { var: string; assignDefault?: string[] }>([
  [
    'inputBorderRadius',
    {
      var: 'components.input.global.borderRadius',
    },
  ],
  [
    'inputBorderWidth',
    {
      var: 'components.input.global.borderWidth',
    },
  ],
  [
    'inputColor',
    {
      var: 'components.input.global.color',
    },
  ],
  [
    'inputPlaceholderColor',
    {
      var: 'components.input.global.placeholderColor',
    },
  ],
  [
    'inputFont',
    {
      var: 'components.input.size.default.typography',
    },
  ],
  [
    'inputHeight',
    {
      var: 'components.input.size.default.height',
    },
  ],
  [
    'inputBg',
    {
      var: 'components.input.state.default.initial.bg',
      assignDefault: ['inputHoverBg'],
    },
  ],
  [
    'inputBorderColor',
    {
      var: 'components.input.state.default.initial.border',
      assignDefault: ['inputHoverBorderColor'],
    },
  ],
  [
    'inputHoverBg',
    {
      var: 'components.input.state.default.hover.bg',
      assignDefault: ['inputFocusBg'],
    },
  ],
  [
    'inputHoverBorderColor',
    {
      var: 'components.input.state.default.hover.border',
      assignDefault: ['inputFocusBorderColor'],
    },
  ],
  [
    'inputFocusBg',
    {
      var: 'components.input.state.default.focus.bg',
    },
  ],
  [
    'inputFocusBorderColor',
    {
      var: 'components.input.state.default.focus.border',
    },
  ],
  [
    'inputErrorBg',
    {
      var: 'components.input.state.error.initial.bg',
      assignDefault: ['inputErrorHoverBg'],
    },
  ],
  [
    'inputErrorBorderColor',
    {
      var: 'components.input.state.error.initial.border',
      assignDefault: ['inputErrorHoverBorderColor'],
    },
  ],
  [
    'inputErrorHoverBg',
    {
      var: 'components.input.state.error.hover.bg',
      assignDefault: ['inputErrorFocusBg'],
    },
  ],
  [
    'inputErrorHoverBorderColor',
    {
      var: 'components.input.state.error.hover.border',
      assignDefault: ['inputErrorFocusBorderColor'],
    },
  ],
  [
    'inputErrorFocusBg',
    {
      var: 'components.input.state.error.focus.bg',
    },
  ],
  [
    'inputErrorFocusBorderColor',
    {
      var: 'components.input.state.error.focus.border',
    },
  ],
]);
