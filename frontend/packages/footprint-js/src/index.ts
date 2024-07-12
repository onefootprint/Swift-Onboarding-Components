import footprint from './footprint';
import vanillaIntegration from './vanilla-integration';

export default footprint;
vanillaIntegration(footprint);

export type {
  Appearance as FootprintAppearance,
  AppearanceRules as FootprintAppearanceRules,
  AppearanceVariables as FootprintAppearanceVariables,
} from './types/appearance';
export type {
  Footprint,
  AuthDataProps as FootprintAuthDataProps,
  AuthProps as FootprintAuthProps,
  Component as FootprintComponent,
  FormDataProps as FootprintFormDataProps,
  FormOptions as FootprintFormOptions,
  FormProps as FootprintFormProps,
  FormRef as FootprintFormRef,
  Options as FootprintOptions,
  Props as FootprintProps,
  PropsBase as FootprintPropsBase,
  RenderDataProps as FootprintRenderDataProps,
  RenderProps as FootprintRenderProps,
  UpdateLoginMethodsDataProps as FootprintUpdateLoginMethodsDataProps,
  UpdateLoginMethodsProps as FootprintUpdateLoginMethodsProps,
  Variant as FootprintVariant,
  VerifyAuthToken as FootprintVerifyAuthToken,
  VerifyButtonDataProps as FootprintVerifyButtonDataProps,
  VerifyButtonProps as FootprintVerifyButtonProps,
  VerifyDataProps as FootprintVerifyDataProps,
  VerifyProps as FootprintVerifyProps,
  VerifyPublicKey as FootprintVerifyPublicKey,
  L10n,
  SupportedLocale,
} from './types/components';
export { ComponentKind as FootprintComponentKind } from './types/components';
export {
  PrivateEvent as FootprintPrivateEvent,
  PublicEvent as FootprintPublicEvent,
} from './types/events';
export type { IdentifyRequest as FootprintIdentifyRequest } from './types/identify';
export type { FootprintUserData, BootstrapData as FootprintBootstrapData } from './types/bootstrap-data';
export { default as identifyFootprintUser } from './utils/identify-user';
