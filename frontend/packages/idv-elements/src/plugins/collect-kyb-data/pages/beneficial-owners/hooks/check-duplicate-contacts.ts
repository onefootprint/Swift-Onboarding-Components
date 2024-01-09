import { useTranslation } from '@onefootprint/hooks';
import type { BeneficialOwner } from '@onefootprint/types';
import { BeneficialOwnerDataAttribute } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';

const useCheckDuplicateContacts = () => {
  const toast = useToast();
  const { t } = useTranslation('kyb.pages.beneficial-owners.form.errors');

  return (beneficialOwners: BeneficialOwner[]) => {
    const emails = beneficialOwners.map(
      bo => bo[BeneficialOwnerDataAttribute.email],
    );
    const emailsSet = new Set(emails);
    if (emails.length !== emailsSet.size) {
      toast.show({
        title: t('duplicate-email.title'),
        description: t('duplicate-email.description'),
        variant: 'error',
      });
      return true;
    }

    const phoneNumbers = beneficialOwners.map(
      bo => bo[BeneficialOwnerDataAttribute.phoneNumber],
    );
    const phoneNumbersSet = new Set(phoneNumbers);
    if (phoneNumbers.length !== phoneNumbersSet.size) {
      toast.show({
        title: t('duplicate-phone-number.title'),
        description: t('duplicate-phone-number.description'),
        variant: 'error',
      });
      return true;
    }

    return false;
  };
};

export default useCheckDuplicateContacts;
