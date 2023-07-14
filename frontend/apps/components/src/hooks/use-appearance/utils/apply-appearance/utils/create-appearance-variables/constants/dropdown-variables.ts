const dropdownVariables = new Map<
  string,
  { var: string; assignDefault?: string[] }
>([
  [
    'dropdownBg',
    {
      var: '--fp-base-dropdown-base-bg-primary',
    },
  ],
  [
    'dropdownHoverBg',
    {
      var: '--fp-base-dropdown-base-bg-primary-hover',
    },
  ],
  [
    'dropdownBorderColor',
    {
      var: '--fp-base-dropdown-base-border',
    },
  ],
  [
    'dropdownBorderWidth',
    {
      var: '--fp-border-width-default',
    },
  ],
  [
    'dropdownBorderRadius',
    {
      var: '--fp-base-dropdown-border-radius',
    },
  ],
  [
    'dropdownElevation',
    {
      var: '--fp-base-dropdown-elevation',
    },
  ],
  [
    'dropdownColorPrimary',
    {
      var: '--fp-base-dropdown-base-text-primary',
    },
  ],
  [
    'dropdownColorSecondary',
    {
      var: '--fp-base-dropdown-base-text-secondary',
    },
  ],
  [
    'dropdownFooterBg',
    {
      var: '--fp-base-dropdown-base-bg-address-footer',
    },
  ],
]);

export default dropdownVariables;
