import { useTranslation } from '@onefootprint/hooks';
import {
  IcoBuilding24,
  IcoCreditcard24,
  IcoDollar24,
  IcoFileText24,
  IcoFileText224,
  IcoUsers24,
} from '@onefootprint/icons';
import { DocumentDI, IdDI, InvestorProfileDI } from '@onefootprint/types';
import React from 'react';

import type { Fieldset } from '../../../../vault.types';
import Nationality from './components/nationality';
import SSN from './components/ssn';
import State from './components/state';

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
        {
          di: IdDI.ssn9,
          renderCustomField: ({ di, entity }) => (
            <SSN di={di} entity={entity} />
          ),
        },
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
        {
          di: IdDI.state,
          renderCustomField: ({ di, entity }) => (
            <State di={di} entity={entity} />
          ),
        },
      ],
    },
    investorProfile: {
      title: t('investor-profile.title'),
      iconComponent: IcoDollar24,
      fields: [
        { di: InvestorProfileDI.occupation },
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
      iconComponent: IcoFileText24,
      fields: [
        { di: DocumentDI.latestDriversLicenseFront },
        { di: DocumentDI.latestIdCardFront },
        { di: DocumentDI.latestPassport },
      ],
    },
    cards: {
      title: t('cards.title'),
      iconComponent: IcoCreditcard24,
      fields: [],
    },
    custom: {
      title: t('custom.title'),
      iconComponent: IcoFileText24,
      fields: [],
    },
  };
};

export default useFieldsets;
