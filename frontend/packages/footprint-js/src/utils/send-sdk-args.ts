import { version } from '../../package.json';
import type {
  AuthDataProps,
  FormDataProps,
  Props,
  RenderDataProps,
  VerifyButtonDataProps,
  VerifyDataProps,
} from '../types/components';
import { ComponentKind } from '../types/components';

const API_BASE_URL = process.env.API_BASE_URL ?? '';
const SDK_VERSION = version || '';
const NUM_RETRIES = 3;

enum SdkKind {
  VerifyV1 = 'verify_v1',
  AuthV1 = 'auth_v1',
  FormV1 = 'form_v1',
  RenderV1 = 'render_v1',
  VerifyButtonV1 = 'verify_button_v1',
}

const SdkKindByComponentKind: Record<ComponentKind, SdkKind> = {
  [ComponentKind.Verify]: SdkKind.VerifyV1,
  [ComponentKind.Auth]: SdkKind.AuthV1,
  [ComponentKind.Form]: SdkKind.FormV1,
  [ComponentKind.Render]: SdkKind.RenderV1,
  [ComponentKind.VerifyButton]: SdkKind.VerifyButtonV1,
};

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

const camelToSnakeCase = (str: string) =>
  str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

const fixKeys = (fn: Function) => (obj: unknown) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  const entries: unknown[][] = Object.entries(obj).map(([k, v]) => {
    let value;
    if (Array.isArray(v)) {
      value = v.map(fixKeys(fn));
    } else if (Object(v) === v) {
      value = fixKeys(fn)(v);
    } else {
      value = v;
    }

    const entry = [fn(k), value];
    return entry;
  });

  return Object.fromEntries(entries);
};

const convertKeysToSnakeCase = fixKeys(camelToSnakeCase);

const request = (args: SendSdkArgsRequest) =>
  fetch(`${API_BASE_URL}/org/sdk_args`, {
    method: 'POST',
    headers: {
      'x-fp-client-version': `footprint-js ${SDK_VERSION}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args),
  });

const sendSdkArgsRecursive = async (
  payload: SendSdkArgsRequest,
  numRetries: number,
): Promise<SendSdkArgsResponse> =>
  request(payload)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      if (numRetries > 0) {
        return sendSdkArgsRecursive(payload, numRetries - 1);
      }
      throw new Error(response.statusText);
    })
    .catch(error => console.error(error.message));

const sendSdkArgs = async (props: Props): Promise<string | undefined> => {
  const data = getSdkArgsDataPayload(props);
  if (!data) {
    console.error(
      'Footprint: Could not get data payload for sdk args. Please make sure the SDK integration is correct.',
    );
    return undefined;
  }
  const kind = SdkKindByComponentKind[props.kind];
  const result = await sendSdkArgsRecursive(
    {
      data: convertKeysToSnakeCase(data),
      kind,
    },
    NUM_RETRIES,
  );
  if (!result) {
    console.error(
      'Footprint: Could not save sdk ars, this could be due to connectivity problems.',
    );
    return undefined;
  }
  return result.token;
};

export default sendSdkArgs;
