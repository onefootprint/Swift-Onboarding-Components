import initFootprintComponent from './footprint-components';

const footprintComponent = initFootprintComponent();

export type {
  FootprintAppearance,
  FootprintAppearanceRules,
  FootprintAppearanceTheme,
  FootprintAppearanceVariables,
  FootprintComponent,
  FootprintComponentProps,
  FootprintComponentRenderProps,
  SecureFormCallbacks,
  SecureFormDataProps,
  SecureFormProps,
  SecureFormVariant,
  SecureRenderProps,
} from './types';
export {
  FootprintComponentKind,
  FootprintComponentsEvent,
  SecureFormEvent,
  SecureFormType,
} from './types';

export default footprintComponent;
