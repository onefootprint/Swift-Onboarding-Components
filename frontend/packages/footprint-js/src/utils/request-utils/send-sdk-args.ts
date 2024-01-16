import type {
  AuthDataProps,
  FormDataProps,
  Props,
  RenderDataProps,
  VerifyButtonDataProps,
  VerifyDataProps,
} from '../../types/components';
import { ComponentKind } from '../../types/components';
import type { SdkKind } from './constants';
import {
  API_BASE_URL,
  SDK_NAME,
  SDK_VERSION,
  SdkKindByComponentKind,
} from './constants';
import transformKeys from './transform-keys';

const NUM_RETRIES = 3;

type SendSdkArgsRequest =
  | {
      kind: SdkKind.VerifyV1;
      data: VerifyDataProps;
    }
  | {
      kind: SdkKind.AuthV1;
      data: AuthDataProps;
    }
  | {
      kind: SdkKind.FormV1;
      data: FormDataProps;
    }
  | {
      kind: SdkKind.RenderV1;
      data: RenderDataProps;
    }
  | {
      kind: SdkKind.VerifyButtonV1;
      data: VerifyButtonDataProps;
    };

type SendSdkArgsResponse = {
  token: string;
  expires_at: string;
};

const getSdkArgsDataPayload = (
  props: Props,
):
  | VerifyDataProps
  | AuthDataProps
  | FormDataProps
  | RenderDataProps
  | VerifyButtonDataProps
  | undefined => {
  const { kind } = props;

  if (kind === ComponentKind.Verify) {
    return {
      publicKey: props.publicKey,
      authToken: props.authToken,
      userData: props.userData,
      options: props.options,
      l10n: props.l10n,
    } as VerifyDataProps;
  }
  if (kind === ComponentKind.Auth) {
    return {
      publicKey: props.publicKey,
      userData: props.userData,
      options: props.options,
      l10n: props.l10n,
    } as AuthDataProps;
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
  const kind = SdkKindByComponentKind[props.kind];
  const result = await sendSdkArgsRecursive(
    {
      data: transformKeys(data),
      kind,
    },
    NUM_RETRIES,
  );
  return result ? result.token : undefined;
};

export default sendSdkArgs;
