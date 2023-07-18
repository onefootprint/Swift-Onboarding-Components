import initFootprintComponent from './footprint-components';
import vanillaIntegration from './utils/footprint-components-vanilla';

const footprintComponent = initFootprintComponent();
vanillaIntegration(footprintComponent);

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
