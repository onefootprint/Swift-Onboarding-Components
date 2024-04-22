import {
  appendLoadingElements,
  appendOverlayContainer,
  getWindowUrl,
  removeOverlayAndLoading,
} from '@onefootprint/core';
import type { FootprintProps as Props } from '@onefootprint/footprint-js';
import {
  getSdkArgsDataPayload,
  getSdkKind,
} from '@onefootprint/footprint-js/src/utils/request-utils/send-sdk-args';
import transformKeys from '@onefootprint/footprint-js/src/utils/request-utils/transform-keys';
import { isUpdateLoginMethods } from '@onefootprint/footprint-js/src/utils/type-guards';
import { getSearchParams } from '@onefootprint/footprint-js/src/utils/url-utils';
import Postmate from '@onefootprint/postmate';

type ParentApi = Postmate.ParentAPI;

const getUniqueId = (): string => Math.random().toString(36).substring(2);

const getPostmate = async (
  container: HTMLElement,
  uId: string,
  url: string,
  authToken?: string,
): Promise<Postmate.ParentAPI> =>
  new Postmate({
    classListArray: ['footprint-modal', 'footprint-modal-loading'],
    container,
    name: `footprint-iframe-${uId}`,
    url,
    allow:
      'otp-credentials; publickey-credentials-get *; camera *; clipboard-write;',
    model: {
      authToken,
      initId: uId,
      sdkUrl: getWindowUrl(),
      sdkVersion: '0',
    },
  });

const sendSdkArgsRecursive = async (
  payload: Record<string, unknown>,
  retries: number,
): Promise<{ token: string; expires_at: string }> =>
  fetch(`https://api.dev.onefootprint.com/org/sdk_args`, {
    method: 'POST',
    headers: {
      'x-fp-client-version': `'footprint-js' 0 ${payload.kind}`.trim(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }).then(res => {
    if (res.ok) return res.json();
    return retries > 0 ? sendSdkArgsRecursive(payload, retries - 1) : undefined;
  });

const sendSdkArgs = async (props: Props): Promise<string | undefined> => {
  const kind = getSdkKind(props);
  const data = transformKeys(getSdkArgsDataPayload(props));

  if (!data) return undefined;
  return sendSdkArgsRecursive({ data, kind }, 3)
    .then(x => x.token || undefined)
    .catch(() => undefined);
};

const fakeSdk = (() => ({
  init: (props: Props) => {
    const uId = getUniqueId();
    let parentApi: ParentApi | null = null;

    const destroy = () => {
      removeOverlayAndLoading(uId);
      if (parentApi) {
        parentApi.destroy();
        parentApi = null;
      }
    };

    return {
      render: async (
        appUrl?: string,
      ): Promise<void | Postmate.ParentAPI | null> => {
        if (!appUrl) {
          destroy();
          return console.error('No app url provided');
        }

        const container = appendOverlayContainer(uId);
        appendLoadingElements(uId, container);

        const token = await sendSdkArgs(props);
        if (!token) {
          destroy();
          return console.error('Failed to send sdk args');
        }

        const base = isUpdateLoginMethods(props) ? `${appUrl}/user` : appUrl;
        const url = `${base}?${getSearchParams(props, token)}`.trim();
        parentApi = await getPostmate(
          container,
          uId,
          url,
          props.authToken,
        ).then(api => {
          api.on('canceled', () /** @ts-ignore */ => {
            props?.onCancel();
            destroy();
          });
          api.on('closed', () /** @ts-ignore */ => {
            props?.onClose();
            destroy();
          });
          api.on('completed', (x) /** @ts-ignore */ => {
            props?.onComplete(x);
            destroy();
          });
          return api;
        });

        return parentApi;
      },
      destroy,
    };
  },
}))();

export default fakeSdk;
