import { useTranslation } from '@onefootprint/hooks';
import {
  IcoBuilding24,
  IcoCreditcard24,
  IcoDollar24,
  IcoFileText224,
  IcoUsers24,
} from '@onefootprint/icons';
import { DocumentDI, IdDI, InvestorProfileDI } from '@onefootprint/types';
import React from 'react';

import type { Fieldset } from '../../../../vault.types';
import Nationality from './components/nationality';

const useFieldsets = (): Fieldset => {
  const { t } = useTranslation('pages.user.vault');
  return {
    basic: {
      title: t('basic.title'),
      iconComponent: IcoFileText224,
      fields: [
        { di: IdDI.firstName },
        { di: IdDI.lastName },
        { di: IdDI.email },
        { di: IdDI.phoneNumber },
      ],
    },
    identity: {
      title: t('identity.title'),
      iconComponent: IcoUsers24,
      fields: [
        { di: IdDI.ssn9 },
        { di: IdDI.ssn4 },
        { di: IdDI.dob },
        {
          di: IdDI.nationality,
          renderCustomField: ({ di, entity }) => (
            <Nationality di={di} entity={entity} />
          ),
        },
      ],
    },
    address: {
      title: t('address.title'),
      iconComponent: IcoBuilding24,
      fields: [
        { di: IdDI.country },
        { di: IdDI.addressLine1 },
        { di: IdDI.addressLine2 },
        { di: IdDI.city },
        { di: IdDI.zip },
        { di: IdDI.state },
      ],
    },
    investorProfile: {
      title: t('investor-profile.title'),
      iconComponent: IcoDollar24,
      fields: [
        { di: InvestorProfileDI.occupation },
        { di: InvestorProfileDI.employedByBrokerageFirm },
        { di: InvestorProfileDI.annualIncome },
        { di: InvestorProfileDI.netWorth },
        { di: InvestorProfileDI.investmentGoals },
        { di: InvestorProfileDI.riskTolerance },
        { di: DocumentDI.finraComplianceLetter },
        { di: InvestorProfileDI.declarations },
        { di: DocumentDI.finraComplianceLetter },
      ],
    },
    documents: {
      title: t('documents.title'),
      iconComponent: IcoDollar24,
      fields: [
        { di: DocumentDI.latestDriversLicenseFront },
        { di: DocumentDI.latestIdCardFront },
        { di: DocumentDI.latestPassport },
      ],
    },
    paymentCardData: {
      title: t('payment-card-data.title'),
      iconComponent: IcoCreditcard24,
      fields: [],
    },
  };
};

export default useFieldsets;
