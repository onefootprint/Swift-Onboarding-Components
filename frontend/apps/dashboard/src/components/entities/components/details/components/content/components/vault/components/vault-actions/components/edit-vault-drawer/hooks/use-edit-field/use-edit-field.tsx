import useEntityVault from '@/entities/hooks/use-entity-vault';
import {
  type DataIdentifier,
  type Entity,
  InvestorProfileDI,
  isVaultDataDecrypted,
  isVaultDataEmpty,
} from '@onefootprint/types';
import { BusinessDI, IdDI } from '@onefootprint/types';
import { TenantPreviewApi } from '@onefootprint/types/src/api/get-tenants';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import useSession from 'src/hooks/use-session';

const useEditField = (entity: Entity) => {
  const { t } = useTranslation('common', { keyPrefix: 'di' });
  const { data: vaultData } = useEntityVault(entity.id, entity);
  const {
    data: { org },
  } = useSession();

  const getLabel = (di: DataIdentifier, _isDecrypted: boolean) => {
    const isInvestorProfileDI = (Object.values(InvestorProfileDI) as DataIdentifier[]).includes(di);
    if (isInvestorProfileDI) {
      const noLabelDIs = [
        InvestorProfileDI.annualIncome,
        InvestorProfileDI.netWorth,
        InvestorProfileDI.fundingSources,
        InvestorProfileDI.investmentGoals,
        InvestorProfileDI.riskTolerance,
      ];
      if (noLabelDIs.includes(di as InvestorProfileDI)) {
        return null;
      }
    }

    const hasLegalStatus = !!vaultData?.vault[IdDI.usLegalStatus];
    if (di === IdDI.nationality && hasLegalStatus) {
      return t('id.country_of_birth');
    }

    return t(di as ParseKeys<'common'>);
  };

  const canEditField = (di: DataIdentifier) => {
    if (di === IdDI.ssn4) {
      // BE updates both ssn4 and ssn9 when ssn9 is changed and errors if only ssn4 is updated
      return !vaultData?.vault[IdDI.ssn9];
    }

    const editableFields: DataIdentifier[] = [
      IdDI.firstName,
      IdDI.middleName,
      IdDI.lastName,
      IdDI.dob,
      IdDI.ssn9,
      IdDI.addressLine1,
      IdDI.addressLine2,
      IdDI.city,
      IdDI.state,
      IdDI.country,
      IdDI.zip,
      IdDI.nationality,
      IdDI.usLegalStatus,
      IdDI.visaKind,
      IdDI.visaExpirationDate,
      IdDI.citizenships,
      InvestorProfileDI.employmentStatus,
      InvestorProfileDI.occupation,
      InvestorProfileDI.employer,
      InvestorProfileDI.annualIncome,
      InvestorProfileDI.netWorth,
      InvestorProfileDI.fundingSources,
      InvestorProfileDI.investmentGoals,
      InvestorProfileDI.riskTolerance,
      BusinessDI.name,
      BusinessDI.doingBusinessAs,
      BusinessDI.website,
      BusinessDI.phoneNumber,
      BusinessDI.tin,
      BusinessDI.corporationType,
      BusinessDI.addressLine1,
      BusinessDI.addressLine2,
      BusinessDI.city,
      BusinessDI.state,
      BusinessDI.country,
      BusinessDI.zip,
      BusinessDI.formationState,
      BusinessDI.formationDate,
    ];
    if (org?.allowedPreviewApis.includes(TenantPreviewApi.ManageVerifiedContactInfo)) {
      editableFields.push(IdDI.phoneNumber, IdDI.email);
    }

    return editableFields.includes(di);
  };

  const getProps = (di: DataIdentifier) => {
    const value = vaultData?.vault[di];
    const isDecrypted = isVaultDataDecrypted(value);

    return {
      label: getLabel(di, isDecrypted),
      value,
      transforms: vaultData?.transforms[di],
      isDecrypted,
      isEmpty: isVaultDataEmpty(value),
      canEdit: canEditField(di),
    };
  };

  return getProps;
};

export default useEditField;
