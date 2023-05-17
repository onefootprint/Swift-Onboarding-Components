import buttonVariables from './button-variables';
import hintVariables from './hint-variables';
import labelVariables from './label-variables';
import linkButtonVariables from './link-button-variables';

const variablesMap = new Map<string, { var: string; assignDefault?: string[] }>(
  [
    [
      'borderRadius',
      {
        var: 'borderRadius.default',
        assignDefault: [
          'buttonBorderRadius',
          'dialogBorderRadius',
          'inputBorderRadius',
          'dropdownBorderRadius',
        ],
      },
    ],
    [
      'colorError',
      {
        var: 'color.error',
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
        var: 'color.warning',
        assignDefault: [],
      },
    ],
    [
      'colorSuccess',
      {
        var: 'color.success',
        assignDefault: [],
      },
    ],
    [
      'colorAccent',
      {
        var: 'color.accent',
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
        var: 'borderColor.error',
        assignDefault: ['inputErrorBorderColor'],
      },
    ],
    ...buttonVariables,
    ...linkButtonVariables,
    ...labelVariables,
    ...hintVariables,
  ],
);

export default variablesMap;
