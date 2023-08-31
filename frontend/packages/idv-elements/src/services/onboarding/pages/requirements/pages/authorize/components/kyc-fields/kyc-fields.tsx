import { useTranslation } from '@onefootprint/hooks';
import {
  IcoBuilding24,
  IcoCake24,
  IcoCar24,
  IcoDollar24,
  IcoEmail24,
  IcoFileText24,
  IcoFlag24,
  IcoGlobe24,
  IcoGreenCard24,
  IcoIdCard24,
  Icon,
  IcoPassport24,
  IcoPhone24,
  IcoSelfie24,
  IcoUserCircle24,
  IcoVisaPassport24,
  IcoWork24,
} from '@onefootprint/icons';
import {
  CollectedDocumentDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKycDataOption,
  SupportedIdDocTypes,
} from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';

import { isKycCdo } from '../../../../../../utils/cdo-utils';
import { FieldProps } from '../field';
import FieldsList from '../fields-list';

const IconByCollectedKycDataOption: Record<CollectedKycDataOption, Icon> = {
  [CollectedKycDataOption.name]: IcoUserCircle24,
  [CollectedKycDataOption.email]: IcoEmail24,
  [CollectedKycDataOption.phoneNumber]: IcoPhone24,
  [CollectedKycDataOption.ssn4]: IcoFileText24,
  [CollectedKycDataOption.ssn9]: IcoFileText24,
  [CollectedKycDataOption.dob]: IcoCake24,
  [CollectedKycDataOption.fullAddress]: IcoBuilding24,
  [CollectedKycDataOption.nationality]: IcoFlag24,
  [CollectedKycDataOption.usLegalStatus]: IcoGlobe24,
};

const IconByIdDocType: Record<SupportedIdDocTypes, Icon> = {
  [SupportedIdDocTypes.idCard]: IcoIdCard24,
  [SupportedIdDocTypes.driversLicense]: IcoCar24,
  [SupportedIdDocTypes.passport]: IcoPassport24,
  [SupportedIdDocTypes.workPermit]: IcoWork24,
  [SupportedIdDocTypes.residenceDocument]: IcoGreenCard24,
  [SupportedIdDocTypes.visa]: IcoVisaPassport24,
};

type KycFieldsProps = {
  data: (
    | CollectedKycDataOption
    | CollectedDocumentDataOption
    | CollectedInvestorProfileDataOption
  )[];
  documentTypes: SupportedIdDocTypes[];
  showTitle?: boolean;
};

const KycFields = ({ data, documentTypes, showTitle }: KycFieldsProps) => {
  const { t } = useTranslation('pages.authorize');

  const collectedKycDataOptionLabels: Record<CollectedKycDataOption, string> = {
    [CollectedKycDataOption.name]: t('data-labels.name'),
    [CollectedKycDataOption.email]: t('data-labels.email'),
    [CollectedKycDataOption.phoneNumber]: t('data-labels.phone'),
    [CollectedKycDataOption.ssn4]: t('data-labels.ssn4'),
    [CollectedKycDataOption.ssn9]: t('data-labels.ssn9'),
    [CollectedKycDataOption.dob]: t('data-labels.dob'),
    [CollectedKycDataOption.fullAddress]: t('data-labels.address-full'),
    [CollectedKycDataOption.nationality]: t('data-labels.nationality'),
    [CollectedKycDataOption.usLegalStatus]: t('data-labels.us-legal-status'),
  };
  const docTypeLabels: Record<SupportedIdDocTypes, string> = {
    [SupportedIdDocTypes.idCard]: t('data-labels.id-card'),
    [SupportedIdDocTypes.passport]: t('data-labels.passport'),
    [SupportedIdDocTypes.driversLicense]: t('data-labels.driversLicense'),
    [SupportedIdDocTypes.residenceDocument]: t(
      'data-labels.residence-document',
    ),
    [SupportedIdDocTypes.workPermit]: t('data-labels.work-permit'),
    [SupportedIdDocTypes.visa]: t('data-labels.visa'),
  };

  const fields: FieldProps[] = [];
  data.forEach(
    (
      cdo:
        | CollectedKycDataOption
        | CollectedDocumentDataOption
        | CollectedInvestorProfileDataOption,
    ) => {
      if (isKycCdo(cdo)) {
        fields.push({
          IconComponent:
            IconByCollectedKycDataOption[cdo as CollectedKycDataOption],
          label: collectedKycDataOptionLabels[cdo as CollectedKycDataOption],
        });
      }
      if (cdo === CollectedDocumentDataOption.documentAndSelfie) {
        fields.push({
          IconComponent: IcoSelfie24,
          label: t('data-labels.selfie'),
        });
      }
      if (cdo === CollectedInvestorProfileDataOption.investorProfile) {
        fields.push({
          IconComponent: IcoDollar24,
          label: t('data-labels.investor-profile'),
        });
      }
    },
  );

  documentTypes.forEach(docType => {
    fields.push({
      IconComponent: IconByIdDocType[docType],
      label: docTypeLabels[docType],
    });
  });

  return fields.length > 0 ? (
    <>
      {showTitle && (
        <Typography variant="label-1" sx={{ width: '100%' }}>
          {t('kyc.title')}
        </Typography>
      )}
      <FieldsList fields={fields} />
    </>
  ) : null;
};

export default KycFields;
