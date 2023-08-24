import {
  CollectedDataOption,
  CollectedKycDataOption,
  SupportedIdDocTypes,
} from '@onefootprint/types';

import { getRequiredKycCollectFields } from '../../../utils/get-onboarding-config-from-context';

const getSummary = ({
  requirePhone,
  requireSSN,
  ssnKind,
  nationality,
  idDocType,
  selfieRequired,
}: {
  requirePhone: boolean;
  requireSSN: boolean;
  ssnKind?: CollectedKycDataOption.ssn4 | CollectedKycDataOption.ssn9;
  nationality: CollectedKycDataOption.nationality;
  idDocType: SupportedIdDocTypes[];
  selfieRequired: boolean;
}) => {
  const collectedData: (CollectedDataOption | string)[] =
    getRequiredKycCollectFields(requirePhone);
  if (requireSSN) {
    collectedData.push(
      ssnKind === CollectedKycDataOption.ssn4
        ? CollectedKycDataOption.ssn4
        : CollectedKycDataOption.ssn9,
    );
  }
  if (nationality) {
    collectedData.push(CollectedKycDataOption.nationality);
  }
  if (idDocType?.length) {
    idDocType.forEach(doc => {
      collectedData.push(doc);
    });
    if (selfieRequired) {
      collectedData.push('selfie');
    }
  }
  return collectedData;
};

export default getSummary;
