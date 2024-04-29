import type { Icon } from '@onefootprint/icons';
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
  IcoPassport24,
  IcoPassportCard24,
  IcoPhone24,
  IcoSelfie24,
  IcoSsnCard24,
  IcoUserCircle24,
  IcoVisaPassport24,
  IcoVoter24,
  IcoWork24,
  IcoWriting24,
} from '@onefootprint/icons';
import {
  CollectedDocumentDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKycDataOption,
  SupportedIdDocTypes,
} from '@onefootprint/types';
import { Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { isKycCdo } from '../../../../../../utils/cdo-utils';
import type { FieldProps } from '../field';
import FieldsList from '../fields-list';

const IconByCollectedKycDataOption: Record<CollectedKycDataOption, Icon> = {
  [CollectedKycDataOption.name]: IcoUserCircle24,
  [CollectedKycDataOption.email]: IcoEmail24,
  [CollectedKycDataOption.phoneNumber]: IcoPhone24,
  [CollectedKycDataOption.ssn4]: IcoFileText24,
  [CollectedKycDataOption.ssn9]: IcoFileText24,
  [CollectedKycDataOption.dob]: IcoCake24,
  [CollectedKycDataOption.address]: IcoBuilding24,
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
  [SupportedIdDocTypes.voterIdentification]: IcoVoter24,
  [SupportedIdDocTypes.ssnCard]: IcoSsnCard24,
  [SupportedIdDocTypes.lease]: IcoWriting24,
  [SupportedIdDocTypes.bankStatement]: IcoWriting24,
  [SupportedIdDocTypes.utilityBill]: IcoWriting24,
  [SupportedIdDocTypes.proofOfAddress]: IcoWriting24,
  [SupportedIdDocTypes.custom]: IcoWriting24,
  [SupportedIdDocTypes.passportCard]: IcoPassportCard24,
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
  const { t } = useTranslation('idv', {
    keyPrefix: 'onboarding.pages.authorize',
  });

  const collectedKycDataOptionLabels: Record<CollectedKycDataOption, string> = {
    [CollectedKycDataOption.name]: t('data-labels.name'),
    [CollectedKycDataOption.email]: t('data-labels.email'),
    [CollectedKycDataOption.phoneNumber]: t('data-labels.phone'),
    [CollectedKycDataOption.ssn4]: t('data-labels.ssn4'),
    [CollectedKycDataOption.ssn9]: t('data-labels.ssn9'),
    [CollectedKycDataOption.dob]: t('data-labels.dob'),
    [CollectedKycDataOption.address]: t('data-labels.address-full'),
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
    [SupportedIdDocTypes.voterIdentification]: t(
      'data-labels.voterIdentification',
    ),
    [SupportedIdDocTypes.ssnCard]: t('data-labels.ssnCard'),
    [SupportedIdDocTypes.lease]: t('data-labels.lease'),
    [SupportedIdDocTypes.bankStatement]: t('data-labels.bankStatement'),
    [SupportedIdDocTypes.utilityBill]: t('data-labels.utilityBill'),
    [SupportedIdDocTypes.proofOfAddress]: t('data-labels.proofOfAddress'),
    [SupportedIdDocTypes.passportCard]: t('data-labels.passportCard'),
    [SupportedIdDocTypes.custom]: t('data-labels.custom'),
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
        <Text variant="label-1" width="100%">
          {t('kyc.title')}
        </Text>
      )}
      <FieldsList fields={fields} />
    </>
  ) : null;
};

export default KycFields;
