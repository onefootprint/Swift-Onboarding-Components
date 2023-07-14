const linkButtonVariables = new Map<
  string,
  { var: string; assignDefault?: string[] }
>([
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
      assignDefault: ['linkButtonDestructiveHoverColor'],
    },
  ],
  [
    'linkButtonDestructiveHoverColor',
    {
      var: '--fp-link-button-destructive-hover-text',
      assignDefault: ['linkButtonDestructiveActiveColor'],
    },
  ],
  [
    'linkButtonDestructiveActiveColor',
    {
      var: '--fp-link-button-destructive-active-text',
    },
  ],
]);

export default linkButtonVariables;
