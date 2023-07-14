const labelVariables = new Map<
  string,
  { var: string; assignDefault?: string[] }
>([
  [
    'labelColor',
    {
      var: '--fp-base-inputs-initial-label',
    },
  ],
  [
    'labelFont',
    {
      var: '--fp-base-inputs-typography-default-label',
    },
  ],
]);

export default labelVariables;
