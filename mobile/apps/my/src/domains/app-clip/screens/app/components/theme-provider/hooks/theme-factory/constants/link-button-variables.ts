export default new Map<string, { var: string; assignDefault?: string[] }>([
  [
    'linkButtonColor',
    {
      var: 'components.linkButton.variant.default.color.text.initial',
      assignDefault: ['linkButtonHoverColor'],
    },
  ],
  [
    'linkButtonHoverColor',
    {
      var: 'components.linkButton.variant.default.color.text.hover',
    },
  ],
  [
    'linkButtonDestructiveColor',
    {
      var: 'components.linkButton.destructive.color.text.initial',
      assignDefault: ['linkButtonDestructiveHoverColor'],
    },
  ],
  [
    'linkButtonDestructiveHoverColor',
    {
      var: 'components.linkButton.destructive.color.text.hover',
    },
  ],
]);
