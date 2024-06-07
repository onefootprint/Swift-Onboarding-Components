import type { NextToast } from '@onefootprint/ui';
import type { TFunction } from 'i18next';

const alertDecision =
  (t: TFunction<'common'>, show: (toast: NextToast, hideMs?: number) => string) => (str: string) => {
    let description: string;

    if (str === 'accepted') {
      description = t('doc.you-accepted');
    } else if (str === 'rejected') {
      description = t('doc.you-rejected');
    } else {
      description = str;
    }

    return show({
      description,
      title: t('document-reviewed'),
      variant: 'default',
    });
  };

export default alertDecision;
