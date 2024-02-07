import { version } from '../../../package.json';
import { ComponentKind } from '../../types/components';

export const API_BASE_URL = process.env.API_BASE_URL ?? '';
export const SDK_VERSION = version || '';
export const SDK_NAME = 'footprint-js';

export enum SdkKind {
  AuthV1 = 'auth_v1',
  FormV1 = 'form_v1',
  RenderV1 = 'render_v1',
  UpdateAuthMethodsV1 = 'update_auth_methods_v1',
  VerifyButtonV1 = 'verify_button_v1',
  VerifyV1 = 'verify_v1',
}

export const SdkKindByComponentKind: Record<ComponentKind, SdkKind> = {
  [ComponentKind.Auth]: SdkKind.AuthV1,
  [ComponentKind.Form]: SdkKind.FormV1,
  [ComponentKind.Render]: SdkKind.RenderV1,
  [ComponentKind.UpdateLoginMethods]: SdkKind.UpdateAuthMethodsV1,
  [ComponentKind.Verify]: SdkKind.VerifyV1,
  [ComponentKind.VerifyButton]: SdkKind.VerifyButtonV1,
};
