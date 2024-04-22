import type {
  AuthDataProps,
  FormDataProps,
  Props,
  RenderDataProps,
  UpdateLoginMethodsDataProps,
  VerifyButtonDataProps,
  VerifyDataProps,
} from '../../types/components';
import { ComponentKind } from '../../types/components';
import { isAuthUpdateLoginMethods, isUpdateLoginMethods } from '../type-guards';
import {
  API_BASE_URL,
  SDK_NAME,
  SDK_VERSION,
  SdkKind,
  SdkKindByComponentKind,
} from './constants';
import transformKeys from './transform-keys';

const NUM_RETRIES = 3;

type SendSdkArgsResponse = { token: string; expires_at: string };
type SendSdkArgsRequest =
  | { kind: SdkKind.AuthV1; data: AuthDataProps }
  | { kind: SdkKind.FormV1; data: FormDataProps }
  | { kind: SdkKind.RenderV1; data: RenderDataProps }
  | { kind: SdkKind.UpdateAuthMethodsV1; data: { authToken: string } }
  | { kind: SdkKind.VerifyButtonV1; data: VerifyButtonDataProps }
  | { kind: SdkKind.VerifyV1; data: VerifyDataProps };

type ArgsDataPayload =
  | AuthDataProps
  | FormDataProps
  | RenderDataProps
  | UpdateLoginMethodsDataProps
  | VerifyButtonDataProps
  | VerifyDataProps
  | undefined;

export const getSdkKind = (props: Props): SdkKind =>
  isUpdateLoginMethods(props)
    ? SdkKind.UpdateAuthMethodsV1
    : SdkKindByComponentKind[props.kind];

export const getSdkArgsDataPayload = (props: Props): ArgsDataPayload => {
  const { kind } = props;

  if (kind === ComponentKind.Verify || kind === ComponentKind.Components) {
    return {
      publicKey: props.publicKey,
      authToken: props.authToken,
      userData: props.userData,
      options: props.options,
      l10n: props.l10n,
      isComponentsSdk: kind === ComponentKind.Components,
    } as VerifyDataProps;
  }
  if (kind === ComponentKind.UpdateLoginMethods) {
    return {
      authToken: props.authToken,
      userData: props.userData,
      options: props.options,
      l10n: props.l10n,
    };
  }
  if (kind === ComponentKind.Auth) {
    return isAuthUpdateLoginMethods(props)
      ? {
          authToken: props.authToken,
          updateLoginMethods: props.updateLoginMethods,
          userData: props.userData,
          options: props.options,
          l10n: props.l10n,
        }
      : {
          publicKey: props.publicKey,
          userData: props.userData,
          options: props.options,
          l10n: props.l10n,
        };
  }
  if (kind === ComponentKind.Form) {
    return {
      authToken: props.authToken,
      options: props.options,
      title: props.title,
      l10n: props.l10n,
    } as FormDataProps;
  }
  if (kind === ComponentKind.Render) {
    return {
      authToken: props.authToken,
      canCopy: props.canCopy,
      defaultHidden: props.defaultHidden,
      id: props.id,
      label: props.label,
      showHiddenToggle: props.showHiddenToggle,
      l10n: props.l10n,
    } as RenderDataProps;
  }
  if (kind === ComponentKind.VerifyButton) {
    return {
      publicKey: props.publicKey,
      userData: props.userData,
      options: props.options,
      authToken: props.authToken,
      label: props.label,
      l10n: props.l10n,
    } as VerifyButtonDataProps;
  }
  return undefined;
};

const sendSdkArgsRecursive = async (
  payload: SendSdkArgsRequest,
  numRetries: number,
): Promise<SendSdkArgsResponse> =>
  fetch(`${API_BASE_URL}/org/sdk_args`, {
    method: 'POST',
    headers: {
      'x-fp-client-version':
        `${SDK_NAME} ${SDK_VERSION} ${payload.kind}`.trim(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }).then(response => {
    if (response.ok) {
      return response.json();
    }
    if (numRetries > 0) {
      return sendSdkArgsRecursive(payload, numRetries - 1);
    }
    return undefined;
  });

const sendSdkArgs = async (props: Props): Promise<string | undefined> => {
  const data = getSdkArgsDataPayload(props);
  if (!data) {
    return undefined;
  }

  const result = await sendSdkArgsRecursive(
    {
      data: transformKeys(data),
      kind: getSdkKind(props),
    },
    NUM_RETRIES,
  );
  return result ? result.token : undefined;
};

export default sendSdkArgs;
