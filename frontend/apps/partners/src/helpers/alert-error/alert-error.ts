import type { NextToast } from '@onefootprint/ui';
import type { TFunction } from 'i18next';

import getErrorMessage from '../get-error-message/get-error-message';

const isString = (x: unknown): x is string => typeof x === 'string' && !!x;

const alertError =
  (t: TFunction<'common'>, show: (toast: NextToast, hideMs?: number) => string) => (msg: string | Error) =>
    show({
      description: isString(msg) ? msg : getErrorMessage(msg),
      title: t('unable-to-perform-action'),
      variant: 'error',
    });

export default alertError;
