import buttonVariables from './button-variables';
import containerVariables from './container-variables';
import dropdownVariables from './dropdown-variables';
import fontFamilyVariables from './font-family-variables';
import hintVariables from './hint-variables';
import inputVariables from './input-variables';
import labelVariables from './label-variables';
import linkButtonVariables from './link-button-variables';
import linkVariables from './link-variables';
import radioSelectVariables from './radio-select-variables';

const variablesMap = new Map<string, { var: string; assignDefault?: string[] }>([
  [
    'borderRadius',
    {
      var: 'borderRadius.default',
      assignDefault: [
        'buttonBorderRadius',
        'containerBorderRadius',
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
        'radioSelectColor',
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
  ...fontFamilyVariables,
  ...containerVariables,
  ...buttonVariables,
  ...dropdownVariables,
  ...hintVariables,
  ...inputVariables,
  ...labelVariables,
  ...linkButtonVariables,
  ...linkVariables,
  ...radioSelectVariables,
]);

export default variablesMap;
