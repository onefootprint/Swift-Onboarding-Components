export default new Map<string, { var: string; assignDefault?: string[] }>([
  [
    'linkButtonColor',
    {
      var: 'components.linkButton.variant.default.color.text.initial',
      assignDefault: ['linkButtonActiveColor'],
    },
  ],
  [
    'linkButtonActiveColor',
    {
      var: 'components.linkButton.variant.default.color.text.active',
    },
  ],
  [
    'linkButtonDestructiveColor',
    {
      var: 'components.linkButton.destructive.color.text.initial',
      assignDefault: ['linkButtonDestructiveActiveColor'],
    },
  ],
  [
    'linkButtonDestructiveActiveColor',
    {
      var: 'components.linkButton.destructive.color.text.active',
    },
  ],
]);
