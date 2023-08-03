import footprint from './footprint';
import vanillaIntegration from './vanilla-integration';

export default footprint;
vanillaIntegration(footprint);

export type {
  Appearance as FootprintAppearance,
  AppearanceRules as FootprintAppearanceRules,
  AppearanceTheme as FootprintAppearanceTheme,
  AppearanceVariables as FootprintAppearanceVariables,
} from './types/appearance';
export type {
  Footprint,
  Component as FootprintComponent,
  FormProps as FootprintFormProps,
  Props as FootprintProps,
  PropsBase as FootprintPropsBase,
  RenderProps as FootprintRenderProps,
  Variant as FootprintVariant,
  VerifyButtonProps as FootprintVerifyButtonProps,
  VerifyOptions as FootprintVerifyOptions,
  VerifyProps as FootprintVerifyProps,
} from './types/components';
export {
  ComponentKind as FootprintComponentKind,
  FormType as FootprintFormType,
} from './types/components';
export {
  PrivateEvent as FootprintPrivateEvent,
  PublicEvent as FootprintPublicEvent,
} from './types/events';
export type { IdentifyRequest as FootprintIdentifyRequest } from './types/identify';
export type { FootprintUserData } from './types/user-data';
export { default as identifyFootprintUser } from './utils/identify-user';
