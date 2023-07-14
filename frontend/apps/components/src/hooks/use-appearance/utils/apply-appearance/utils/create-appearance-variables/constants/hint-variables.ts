const hintVariables = new Map<
  string,
  { var: string; assignDefault?: string[] }
>([
  [
    'hintColor',
    {
      var: '--fp-base-inputs-base-hint',
    },
  ],
  [
    'hintErrorColor',
    {
      var: '--fp-base-inputs-base-hint-error',
    },
  ],
  [
    'hintFont',
    {
      var: '--fp-base-inputs-typography-default-hint',
    },
  ],
]);

export default hintVariables;
