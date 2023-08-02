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
    'inputFont',
    {
      var: 'components.input.size.default.typography',
    },
  ],
  [
    'inputColor',
    {
      var: 'components.input.global.color',
    },
  ],
  [
    'inputHeight',
    {
      var: 'components.input.size.default.height',
    },
  ],
  [
    'inputPlaceholderColor',
    {
      var: 'components.input.global.placeholderColor',
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
    'inputElevation',
    {
      var: 'input.state.default.initial.elevation',
      assignDefault: ['inputHoverElevation', 'inputFocusElevation'],
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
    'inputHoverElevation',
    {
      var: 'components.input.state.default.hover.elevation',
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
    'inputFocusElevation',
    {
      var: 'components.input.state.default.focus.elevation',
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
    'inputErrorElevation',
    {
      var: 'components.input.state.error.initial.elevation',
      assignDefault: ['inputErrorHoverElevation', 'inputErrorFocusElevation'],
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
    'inputErrorHoverElevation',
    {
      var: 'components.input.state.error.hover.elevation',
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
  [
    'inputErrorFocusElevation',
    {
      var: 'components.input.state.error.focus.elevation',
    },
  ],
]);
