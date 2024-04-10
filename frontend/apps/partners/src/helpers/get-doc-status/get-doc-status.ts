import type { Color } from '@onefootprint/design-tokens';
import type { TFunction } from 'i18next';

type T = TFunction<'common'>;

const toLowercase = (x: string) => String(x).toLowerCase();
const noUnderscore = (x: string) => String(x).replace(/[_-]/g, '');
const normalizeStr = (x: string) => toLowercase(noUnderscore(x));

const getDocStatus = (t: T, str: string): { color: Color; text: string } => {
  const text = normalizeStr(str);
  const statuses: Record<string, { color: Color; text: string }> = {
    accepted: { color: 'success', text: t('accepted') },
    notrequested: { color: 'error', text: t('not-requested') },
    rejected: { color: 'error', text: t('rejected') },
    waitingforreview: { color: 'info', text: t('waiting-for-review') },
    waitingforupload: { color: 'primary', text: t('waiting-for-upload') },
  };

  return statuses[text] || { color: 'primary', text };
};

export default getDocStatus;
