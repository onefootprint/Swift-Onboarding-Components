import {
  IcoBuilding24,
  IcoCreditcard24,
  IcoDollar24,
  IcoFileText24,
  IcoFileText224,
  IcoGlobe24,
  IcoUsers24,
} from '@onefootprint/icons';
import type { DataIdentifier, Entity } from '@onefootprint/types';
import { DocumentDI, IdDI, InvestorProfileDI } from '@onefootprint/types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { Fieldset } from '../../../../vault.types';
import Citizenships from './components/citizenships';
import CountryOfBirth from './components/country-of-birth';
import Nationality from './components/nationality';
import SSN from './components/ssn';
import State from './components/state';
import UsLegalStatus from './components/us-legal-status';
import VisaKind from './components/visa-kind';

type CustomFieldProp = { di: DataIdentifier; entity: Entity };

const useFieldsets = (excludeNationality?: boolean): Fieldset => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.user.vault' });

  const fieldsets = {
    basic: {
      title: t('basic.title'),
      iconComponent: IcoFileText224,
      fields: [
        { di: IdDI.firstName },
        { di: IdDI.middleName },
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
          di: IdDI.itin,
          renderCustomField: ({ di, entity }: CustomFieldProp) => <SSN di={di} entity={entity} />,
        },
        {
          di: IdDI.ssn9,
          renderCustomField: ({ di, entity }: CustomFieldProp) => <SSN di={di} entity={entity} />,
        },
        {
          di: IdDI.ssn4,
          renderCustomField: ({ di, entity }: CustomFieldProp) => <SSN di={di} entity={entity} />,
        },
        { di: IdDI.dob },
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
          renderCustomField: ({ di, entity }: CustomFieldProp) => <State di={di} entity={entity} />,
        },
      ],
    },
    usLegalStatus: {
      title: t('us-legal-status.title'),
      iconComponent: IcoGlobe24,
      fields: [
        {
          di: IdDI.usLegalStatus,
          renderCustomField: ({ di, entity }: CustomFieldProp) => <UsLegalStatus di={di} entity={entity} />,
        },
        {
          di: IdDI.nationality,
          renderCustomField: ({ di, entity }: CustomFieldProp) => <CountryOfBirth di={di} entity={entity} />,
        },
        {
          di: IdDI.citizenships,
          renderCustomField: ({ di, entity }: CustomFieldProp) => <Citizenships di={di} entity={entity} />,
        },
        {
          di: IdDI.visaKind,
          renderCustomField: ({ di, entity }: CustomFieldProp) => <VisaKind di={di} entity={entity} />,
        },
        {
          di: IdDI.visaExpirationDate,
        },
      ],
    },
    investorProfile: {
      title: t('investor-profile.title'),
      iconComponent: IcoDollar24,
      fields: [
        { di: InvestorProfileDI.employmentStatus },
        { di: InvestorProfileDI.occupation },
        { di: InvestorProfileDI.employer },
        { di: InvestorProfileDI.annualIncome },
        { di: InvestorProfileDI.netWorth },
        { di: InvestorProfileDI.investmentGoals },
        { di: InvestorProfileDI.riskTolerance },
        { di: DocumentDI.finraComplianceLetter },
        { di: InvestorProfileDI.declarations },
        { di: InvestorProfileDI.brokerageFirmEmployer },
        { di: InvestorProfileDI.seniorExecutiveSymbols },
        { di: InvestorProfileDI.familyMemberNames },
        { di: InvestorProfileDI.politicalOrganization },
        { di: DocumentDI.finraComplianceLetter },
      ],
    },
    documents: {
      title: t('documents.title'),
      iconComponent: IcoFileText24,
      fields: [],
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

  if (!excludeNationality) {
    fieldsets.identity.fields.push({
      di: IdDI.nationality,
      renderCustomField: ({ di, entity }: CustomFieldProp) => <Nationality di={di} entity={entity} />,
    });
  }

  return fieldsets;
};

export default useFieldsets;
