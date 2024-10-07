import { BankDIField, CardDIField } from '@onefootprint/types';
import { useTranslation } from 'react-i18next';

const useGetTranslationWithoutAlias = () => {
  const { t } = useTranslation('common');

  const cardTranslations: Record<CardDIField, string> = {
    [CardDIField.name]: t('di.card.name'),
    [CardDIField.issuer]: t('di.card.issuer'),
    [CardDIField.number]: t('di.card.number'),
    [CardDIField.numberLast4]: t('di.card.number_last4'),
    [CardDIField.cvc]: t('di.card.cvc'),
    [CardDIField.expiration]: t('di.card.expiration'),
    [CardDIField.expirationMonth]: t('di.card.verbose.expiration_month'),
    [CardDIField.expirationYear]: t('di.card.verbose.expiration_year'),
    [CardDIField.zip]: t('di.card.verbose.billing_address.zip'),
    [CardDIField.country]: t('di.card.verbose.billing_address.country'),
    [CardDIField.fingerprint]: t('di.card.fingerprint'),
  };

  const bankTranslations: Record<BankDIField, string> = {
    [BankDIField.name]: t('di.bank.name'),
    [BankDIField.accountType]: t('di.bank.account_type'),
    [BankDIField.routingNumber]: t('di.bank.ach_routing_number'),
    [BankDIField.accountNumber]: t('di.bank.ach_account_number'),
    [BankDIField.accountId]: t('di.bank.ach_account_id'),
    [BankDIField.fingerprint]: t('di.bank.fingerprint'),
  };

  return (key: string) => {
    const parts = key.split('.');
    if (parts.length < 3) {
      return key;
    }

    const [type, , ...fieldParts] = parts;
    const fieldKey = fieldParts.join('.') as CardDIField | BankDIField;

    if (type === 'card') {
      return cardTranslations[fieldKey as CardDIField] || key;
    }
    if (type === 'bank') {
      return bankTranslations[fieldKey as BankDIField] || key;
    }

    return key;
  };
};

export default useGetTranslationWithoutAlias;
