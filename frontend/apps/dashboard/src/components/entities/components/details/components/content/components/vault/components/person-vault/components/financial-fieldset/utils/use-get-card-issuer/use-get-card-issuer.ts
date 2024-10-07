import type { VaultValue } from '@onefootprint/types';
import { useTranslation } from 'react-i18next';

const useGetCardIssuer = () => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'fieldset.cards.card-brands' });

  const translations: Partial<Record<string, string>> = {
    mastercard: t('master_card'),
    master_card: t('master_card'),
    visa: t('visa'),
    amex: t('amex'),
    american_express: t('amex'),
    discover: t('discover'),
    diners_club: t('diners_club'),
    jcb: t('jcb'),
    union_pay: t('union_pay'),
    unknown: t('unknown'),
  };

  return (cardIssuer: VaultValue): string => {
    // Our fallback is the DI itself, which will be more useful than "unknown"
    return (typeof cardIssuer === 'string' && translations[cardIssuer]) || String(cardIssuer);
  };
};

export default useGetCardIssuer;
