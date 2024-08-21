/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  appendInlineContainer,
  appendInlineLoader,
  appendLoadingElements,
  appendOverlayContainer,
  getWindowUrl,
  removeOverlayAndLoading,
} from '@onefootprint/core';
import type { FootprintProps as Props } from '@onefootprint/footprint-js';
import { getSdkArgsDataPayload, getSdkKind } from '@onefootprint/footprint-js/src/utils/request-utils/send-sdk-args';
import transformKeys from '@onefootprint/footprint-js/src/utils/request-utils/transform-keys';
import { isUpdateLoginMethods } from '@onefootprint/footprint-js/src/utils/type-guards';
import { getSearchParams } from '@onefootprint/footprint-js/src/utils/url-utils';
import Postmate from '@onefootprint/postmate';
import once from 'lodash/once';

type ParentApi = Postmate.ParentAPI;

const ENV = process.env.NEXT_PUBLIC_VERCEL_ENV;
const baseUrl = ENV === 'production' ? 'https://api.onefootprint.com' : 'https://api.dev.onefootprint.com';
const getUniqueId = (): string => Math.random().toString(36).substring(2);

const getPostmate = async (
  container: HTMLElement,
  variant: 'modal' | 'drawer' | 'inline',
  uId: string,
  url: string,
  authToken?: string,
): Promise<Postmate.ParentAPI> =>
  new Postmate({
    classListArray: [`footprint-${variant}`, `footprint-${variant}-loading`],
    container,
    name: `footprint-iframe-${uId}`,
    url,
    allow: 'otp-credentials; publickey-credentials-get *; camera *; clipboard-write;',
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
  fetch(`${baseUrl}/org/sdk_args`, {
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
    const { containerId, variant } = props;
    const uId = getUniqueId();
    const hasOverlay = variant === 'modal' || variant === 'drawer';
    let parentApi: ParentApi | null = null;
    let isRendered = false;

    const destroy = (_ignore?: unknown) => {
      if (!isRendered || !parentApi) return;
      isRendered = false;
      removeOverlayAndLoading(uId);
      if (parentApi) {
        parentApi.destroy();
        parentApi = null;
      }
    };

    return {
      render: once(async (appUrl?: string): Promise<undefined | Postmate.ParentAPI | null> => {
        if (isRendered) {
          console.error('Already rendered');
          return;
        }

        if (!appUrl) {
          destroy();
          console.error('No app url provided');
          return;
        }
        isRendered = true;
        const container = hasOverlay ? appendOverlayContainer(uId) : appendInlineContainer(uId, containerId);

        if (hasOverlay) {
          appendLoadingElements(uId, container);
        } else {
          appendInlineLoader(uId, container);
        }

        const token = await sendSdkArgs(props);
        if (!token) {
          destroy();
          console.error('Failed to send sdk args');
          return;
        }

        const base = isUpdateLoginMethods(props) ? `${appUrl}/user` : appUrl;
        const url = `${base}?${getSearchParams(props, token)}`.trim();

        parentApi = await getPostmate(container, variant || 'modal', uId, url, props.authToken)
          .then(api => {
            const on = (event: string, callback?: (x?: unknown) => void) => api.on(event, x => destroy(callback?.(x)));

            /** @ts-ignore */
            api.on(`${uId}:auth`, props?.onAuth); /** @ts-ignore */

            api.on(`${uId}:completed`, props?.onComplete); /** @ts-ignore */
            api.on('completed', props?.onComplete); /** @ts-ignore */

            on(`${uId}:canceled`, props?.onCancel); /** @ts-ignore */
            on('canceled', props?.onCancel); /** @ts-ignore */

            on(`${uId}:closed`, props?.onClose); /** @ts-ignore */
            on('closed', props?.onClose); /** @ts-ignore */

            return api;
          })
          .then(api => {
            if (props.kind !== 'form' || !props.getRef) return api;

            const setUpFormRefs = () => {
              const ref: { save: () => Promise<void> } = {
                save: () =>
                  new Promise((resolve, reject) => {
                    parentApi?.on(`${uId}:formSaveComplete`, resolve);
                    parentApi?.on('formSaveComplete', resolve);

                    parentApi?.on(`${uId}:formSaveFailed`, reject);
                    parentApi?.on('formSaveFailed', reject);

                    parentApi?.call('formSaved');
                  }),
              };
              props.getRef?.(ref);
            };

            api.on('started', setUpFormRefs);
            api.on(`${uId}:setUpFormRefs`, setUpFormRefs);

            return api;
          });

        return parentApi;
      }),
      destroy,
    };
  },
}))();

export default fakeSdk;
