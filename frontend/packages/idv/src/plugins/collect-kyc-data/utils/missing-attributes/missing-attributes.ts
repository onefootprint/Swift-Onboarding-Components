import {
  CollectedKycDataOption,
  CollectedKycDataOptionToRequiredAttributes,
  IdDI,
  UsLegalStatus,
} from '@onefootprint/types';

import type { KycData } from '../data-types';

// Returns true if the collectedData doesn't have a value for one of the DIs required by the
// provided cdos
export const isDiMissing = (cdos: CollectedKycDataOption[], collectedData?: KycData) => {
  const requiredDis = cdos.flatMap(option => CollectedKycDataOptionToRequiredAttributes[option]);

  // Adjust requiredDis depending on value of legal status
  if (cdos.some(cdo => cdo === CollectedKycDataOption.usLegalStatus) && IdDI.usLegalStatus in (collectedData || {})) {
    const usLegalStatus = collectedData?.[IdDI.usLegalStatus]?.value;
    if (usLegalStatus === UsLegalStatus.permanentResident || usLegalStatus === UsLegalStatus.visa) {
      requiredDis.push(IdDI.nationality, IdDI.citizenships);
    }
    if (usLegalStatus === UsLegalStatus.visa) {
      requiredDis.push(IdDI.visaKind, IdDI.visaExpirationDate);
    }
  }

  return requiredDis.some(di => {
    const entry = collectedData?.[di];
    const isEntryPopulated = entry?.value || entry?.bootstrap || entry?.disabled || entry?.decrypted || entry?.scrubbed;
    return !isEntryPopulated;
  });
};

export const isMissing = (
  cdos: CollectedKycDataOption[],
  mustCollect: CollectedKycDataOption[],
  collectedData?: KycData,
) =>
  isDiMissing(
    cdos.filter(cdo => mustCollect.includes(cdo)),
    collectedData,
  );
