import buttonVariables from './button-variables';
import hintVariables from './hint-variables';
import inputVariables from './input-variables';
import labelVariables from './label-variables';
import linkButtonVariables from './link-button';
import typographyVariables from './typography-variables';

const variablesMap = new Map<string, { var: string; assignDefault?: string[] }>(
  [
    [
      'borderRadius',
      {
        var: '--fp-border-radius-default',
        assignDefault: [
          'buttonBorderRadius',
          'dialogBorderRadius',
          'inputBorderRadius',
        ],
      },
    ],
    [
      'colorError',
      {
        var: '--fp-semantic-text-info',
        assignDefault: [
          'borderColorError',
          'hintErrorColor',
          'linkButtonDestructiveColor',
        ],
      },
    ],
    [
      'colorWarning',
      {
        var: '--fp-semantic-text-info',
        assignDefault: [],
      },
    ],
    [
      'colorSuccess',
      {
        var: '--fp-semantic-text-info',
        assignDefault: [],
      },
    ],
    [
      'colorAccent',
      {
        var: '--fp-semantic-text-info',
        assignDefault: [
          'linkColor',
          'linkButtonColor',
          'linkButtonHoverColor',
          'linkButtonActiveColor',
        ],
      },
    ],
    [
      'borderColorError',
      {
        var: '--fp-semantic-border-error',
        assignDefault: ['inputErrorBorderColor'],
      },
    ],
    [
      'linkColor',
      {
        var: '--fp-link-color',
        assignDefault: [],
      },
    ],
    [
      'dialogBg',
      {
        var: '--fp-bifrost-dialog-body-bg-primary',
      },
    ],
    [
      'dialogBoxShadow',
      {
        var: '--fp-bifrost-dialog-elevation',
      },
    ],
    [
      'dialogBorderRadius',
      {
        var: '--fp-bifrost-dialog-border-radius',
      },
    ],
    ...buttonVariables,
    ...linkButtonVariables,
    ...labelVariables,
    ...inputVariables,
    ...hintVariables,
    ...typographyVariables,
  ],
);

export default variablesMap;
