const typographyVariables = new Map<
  string,
  { var: string; assignDefault?: string[] }
>([
  [
    'fontFamily',
    {
      var: '--fp-font-family-default',
    },
  ],
]);

export default typographyVariables;
