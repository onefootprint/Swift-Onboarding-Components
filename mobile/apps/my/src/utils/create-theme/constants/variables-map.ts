import buttonVariables from './button-variables';
import hintVariables from './hint-variables';
import inputVariables from './input-variables';
import labelVariables from './label-variables';
import linkButtonVariables from './link-button-variables';
import radioSelectVariables from './radio-select-variables';

const variablesMap = new Map<string, { var: string; assignDefault?: string[] }>([
  [
    'borderRadius',
    {
      var: 'borderRadius.default',
      assignDefault: [
        'buttonBorderRadius',
        'dialogBorderRadius',
        'inputBorderRadius',
        'dropdownBorderRadius',
        'radioSelectBorderRadius',
      ],
    },
  ],
  [
    'colorError',
    {
      var: 'color.error',
      assignDefault: ['borderColorError', 'hintErrorColor', 'linkButtonDestructiveColor'],
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
        'radioSelectSelectedColor',
        'radioSelectSelectedBorderColor',
        'radioSelectComponentsIconSelectedBg',
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
  ...inputVariables,
  ...radioSelectVariables,
]);

export default variablesMap;
