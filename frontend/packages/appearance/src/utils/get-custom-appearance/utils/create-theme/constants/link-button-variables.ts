export default new Map<string, { var: string; assignDefault?: string[] }>([
  [
    'linkButtonColor',
    {
      var: 'components.linkButton.default.color.text.initial',
      assignDefault: ['linkButtonHoverColor', 'linkButtonActiveColor'],
    },
  ],
  [
    'linkButtonHoverColor',
    {
      var: 'components.linkButton.default.color.text.hover',
    },
  ],
  [
    'linkButtonActiveColor',
    {
      var: 'components.linkButton.default.color.text.active',
    },
  ],
  [
    'linkButtonDestructiveColor',
    {
      var: 'components.linkButton.destructive.color.text.initial',
      assignDefault: ['linkButtonDestructiveHoverColor', 'linkButtonDestructiveActiveColor'],
    },
  ],
  [
    'linkButtonDestructiveHoverColor',
    {
      var: 'components.linkButton.destructive.color.text.hover',
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
