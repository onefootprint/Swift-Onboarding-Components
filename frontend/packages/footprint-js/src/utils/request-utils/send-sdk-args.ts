import type {
  AuthDataProps,
  FormDataProps,
  Props,
  RenderDataProps,
  VerifyButtonDataProps,
  VerifyDataProps,
} from '../../types/components';
import { ComponentKind } from '../../types/components';
import { logInfo } from '../logger';
import { getBootstrapData } from '../prop-utils';
import { isAuthUpdateLoginMethods, isUpdateLoginMethods } from '../type-guards';
import { API_BASE_URL, SDK_NAME, SDK_VERSION, SdkKind, SdkKindByComponentKind } from './constants';
import transformKeys, { getNonEmptyKeys } from './transform-keys';

const IS_BACKEND_ACCEPTING_AUTH_TOKEN = false;

type SendSdkArgsRequest =
  | { kind: SdkKind.AuthV1; data: AuthDataProps }
  | { kind: SdkKind.FormV1; data: FormDataProps }
  | { kind: SdkKind.RenderV1; data: RenderDataProps }
  | { kind: SdkKind.UpdateAuthMethodsV1; data: { authToken: string } }
  | { kind: SdkKind.VerifyButtonV1; data: VerifyButtonDataProps }
  | { kind: SdkKind.VerifyV1; data: VerifyDataProps };

type SendSdkArgsResponse = { token: string; expires_at: string };

export const getSdkKind = (props: Props): SdkKind =>
  isUpdateLoginMethods(props) ? SdkKind.UpdateAuthMethodsV1 : SdkKindByComponentKind[props.kind];

export const getSdkArgsDataPayload = (props: Props): SendSdkArgsRequest['data'] => {
  const { kind } = props;

  if (kind === ComponentKind.Verify || kind === ComponentKind.Components) {
    return {
      ...getBootstrapData(props),
      publicKey: props.publicKey,
      authToken: props.authToken,
      options: props.options,
      l10n: props.l10n,
      fixtureResult: props.sandboxOutcome?.overallOutcome,
      documentFixtureResult: props.sandboxOutcome?.documentOutcome,
      sandboxId: props.sandboxId,
      isComponentsSdk: kind === ComponentKind.Components,
      shouldRelayToComponents: kind === ComponentKind.Components ? props.shouldRelayToComponents : undefined,
    };
  }
  if (kind === ComponentKind.UpdateLoginMethods) {
    return {
      ...getBootstrapData(props),
      authToken: props.authToken,
      options: props.options,
      l10n: props.l10n,
    };
  }
  if (kind === ComponentKind.Auth) {
    return isAuthUpdateLoginMethods(props)
      ? {
          ...getBootstrapData(props),
          authToken: props.authToken,
          updateLoginMethods: props.updateLoginMethods,
          options: props.options,
          l10n: props.l10n,
        }
      : props.authToken && IS_BACKEND_ACCEPTING_AUTH_TOKEN // Delete "IS_BACKEND_ACCEPTING_AUTH_TOKEN" variable when backend accepts auth token
        ? {
            ...getBootstrapData(props),
            authToken: props.authToken,
            options: props.options,
            l10n: props.l10n,
          }
        : {
            ...getBootstrapData(props),
            publicKey: props.publicKey,
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
    };
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
    };
  }
  if (kind === ComponentKind.VerifyButton) {
    return {
      ...getBootstrapData(props),
      publicKey: props.publicKey,
      options: props.options,
      authToken: props.authToken,
      label: props.label,
      l10n: props.l10n,
    };
  }

  throw new Error('Invalid kind provided');
};

const sendSdkArgs = async (props: Props): Promise<SendSdkArgsResponse['token']> => {
  const kind = getSdkKind(props);
  const data = getSdkArgsDataPayload(props);

  logInfo(kind, `Sending SDK args: ${getNonEmptyKeys(data)}`);

  const response = await fetch(`${API_BASE_URL}/org/sdk_args`, {
    method: 'POST',
    headers: {
      'x-fp-client-version': `${SDK_NAME} ${SDK_VERSION} ${kind}`.trim(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: transformKeys(data),
      kind: kind,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    if (errorData.message && errorData.support_id) {
      throw new Error(`${errorData.message} (Support ID: ${errorData.support_id})`);
    }
    throw new Error('An error occurred while sending SDK args. Please try again later.');
  }

  const result = await response.json();
  if (result?.token === undefined) {
    throw new Error('Token is undefined');
  }
  return result.token;
};

export default sendSdkArgs;
