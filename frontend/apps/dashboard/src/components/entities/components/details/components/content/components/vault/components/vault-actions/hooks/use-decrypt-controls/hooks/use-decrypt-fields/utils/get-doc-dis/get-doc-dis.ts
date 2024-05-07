import type { DataIdentifier, Document, VaultValue } from '@onefootprint/types';
import {
  DocumentDI,
  isVaultDataEmpty,
  RawJsonKinds,
  SupportedIdDocTypes,
} from '@onefootprint/types';

import { filterDocumentsByKind } from '../../../../../../../person-vault/components/document-fields/utils';

const mainDIs: Partial<Record<DocumentDI, SupportedIdDocTypes>> = {
  [DocumentDI.latestIdCardFront]: SupportedIdDocTypes.idCard,
  [DocumentDI.latestDriversLicenseFront]: SupportedIdDocTypes.driversLicense,
  [DocumentDI.latestPassport]: SupportedIdDocTypes.passport,
  [DocumentDI.latestVisa]: SupportedIdDocTypes.visa,
  [DocumentDI.latestWorkPermitFront]: SupportedIdDocTypes.workPermit,
  [DocumentDI.latestResidenceDocumentFront]:
    SupportedIdDocTypes.residenceDocument,
  [DocumentDI.latestVoterIdentificationFront]:
    SupportedIdDocTypes.voterIdentification,
  [DocumentDI.latestSsnCardFront]: SupportedIdDocTypes.ssnCard,
  [DocumentDI.latestLeaseFront]: SupportedIdDocTypes.lease,
  [DocumentDI.latestBankStatementFront]: SupportedIdDocTypes.bankStatement,
  [DocumentDI.latestUtilityBillFront]: SupportedIdDocTypes.utilityBill,
  [DocumentDI.latestProofOfAddressFront]: SupportedIdDocTypes.proofOfAddress,
  [DocumentDI.latestPassportCardFront]: SupportedIdDocTypes.passportCard,
};

const extractedDIsBase: Partial<Record<SupportedIdDocTypes, DocumentDI[]>> = {
  [SupportedIdDocTypes.idCard]: [
    DocumentDI.idCardFullName,
    DocumentDI.idCardDOB,
    DocumentDI.idCardGender,
    DocumentDI.idCardFullAddress,
    DocumentDI.idCardDocumentNumber,
    DocumentDI.idCardIssuedAt,
    DocumentDI.idCardExpiresAt,
    DocumentDI.idCardIssuingState,
    DocumentDI.idCardIssuingCountry,
    DocumentDI.idCardRefNumber,
    DocumentDI.idCardNationality,
    DocumentDI.idCardClassifiedDocumentType,
    DocumentDI.idCardCurp,
    DocumentDI.idCardCurpValidationResponse,
  ],
  [SupportedIdDocTypes.driversLicense]: [
    DocumentDI.driversLicenseFullName,
    DocumentDI.driversLicenseDOB,
    DocumentDI.driversLicenseGender,
    DocumentDI.driversLicenseFullAddress,
    DocumentDI.driversLicenseDocumentNumber,
    DocumentDI.driversLicenseIssuedAt,
    DocumentDI.driversLicenseExpiresAt,
    DocumentDI.driversLicenseIssuingState,
    DocumentDI.driversLicenseIssuingCountry,
    DocumentDI.driversLicenseRefNumber,
    DocumentDI.driversLicenseNationality,
    DocumentDI.driversLicenseClassifiedDocumentType,
    DocumentDI.driversLicenseCurp,
    DocumentDI.driversLicenseCurpValidationResponse,
  ],
  [SupportedIdDocTypes.passport]: [
    DocumentDI.passportFullName,
    DocumentDI.passportDOB,
    DocumentDI.passportGender,
    DocumentDI.passportFullAddress,
    DocumentDI.passportDocumentNumber,
    DocumentDI.passportIssuedAt,
    DocumentDI.passportExpiresAt,
    DocumentDI.passportIssuingState,
    DocumentDI.passportIssuingCountry,
    DocumentDI.passportRefNumber,
    DocumentDI.passportNationality,
    DocumentDI.passportClassifiedDocumentType,
    DocumentDI.passportCurp,
    DocumentDI.passportCurpValidationResponse,
  ],
  [SupportedIdDocTypes.visa]: [
    DocumentDI.visaFullName,
    DocumentDI.visaDOB,
    DocumentDI.visaGender,
    DocumentDI.visaFullAddress,
    DocumentDI.visaDocumentNumber,
    DocumentDI.visaIssuedAt,
    DocumentDI.visaExpiresAt,
    DocumentDI.visaIssuingState,
    DocumentDI.visaIssuingCountry,
    DocumentDI.visaRefNumber,
    DocumentDI.visaNationality,
    DocumentDI.visaClassifiedDocumentType,
    DocumentDI.visaCurp,
    DocumentDI.visaCurpValidationResponse,
  ],
  [SupportedIdDocTypes.workPermit]: [
    DocumentDI.workPermitFullName,
    DocumentDI.workPermitDOB,
    DocumentDI.workPermitGender,
    DocumentDI.workPermitFullAddress,
    DocumentDI.workPermitDocumentNumber,
    DocumentDI.workPermitIssuedAt,
    DocumentDI.workPermitExpiresAt,
    DocumentDI.workPermitIssuingState,
    DocumentDI.workPermitIssuingCountry,
    DocumentDI.workPermitRefNumber,
    DocumentDI.workPermitNationality,
    DocumentDI.workPermitClassifiedDocumentType,
    DocumentDI.workPermitCurp,
    DocumentDI.workPermitCurpValidationResponse,
  ],
  [SupportedIdDocTypes.residenceDocument]: [
    DocumentDI.residenceDocumentFullName,
    DocumentDI.residenceDocumentDOB,
    DocumentDI.residenceDocumentGender,
    DocumentDI.residenceDocumentFullAddress,
    DocumentDI.residenceDocumentDocumentNumber,
    DocumentDI.residenceDocumentIssuedAt,
    DocumentDI.residenceDocumentExpiresAt,
    DocumentDI.residenceDocumentIssuingState,
    DocumentDI.residenceDocumentIssuingCountry,
    DocumentDI.residenceDocumentRefNumber,
    DocumentDI.residenceDocumentNationality,
    DocumentDI.residenceDocumentClassifiedDocumentType,
    DocumentDI.residenceDocumentCurp,
    DocumentDI.residenceDocumentCurpValidationResponse,
  ],
  [SupportedIdDocTypes.voterIdentification]: [
    DocumentDI.voterIdentificationFullName,
    DocumentDI.voterIdentificationDOB,
    DocumentDI.voterIdentificationGender,
    DocumentDI.voterIdentificationFullAddress,
    DocumentDI.voterIdentificationDocumentNumber,
    DocumentDI.voterIdentificationIssuedAt,
    DocumentDI.voterIdentificationExpiresAt,
    DocumentDI.voterIdentificationIssuingState,
    DocumentDI.voterIdentificationIssuingCountry,
    DocumentDI.voterIdentificationRefNumber,
    DocumentDI.voterIdentificationNationality,
    DocumentDI.voterIdentificationClassifiedDocumentType,
    DocumentDI.voterIdentificationCurp,
    DocumentDI.voterIdentificationCurpValidationResponse,
  ],
  [SupportedIdDocTypes.passportCard]: [
    DocumentDI.passportCardFullName,
    DocumentDI.passportCardDOB,
    DocumentDI.passportCardGender,
    DocumentDI.passportCardFullAddress,
    DocumentDI.passportCardDocumentNumber,
    DocumentDI.passportCardIssuedAt,
    DocumentDI.passportCardExpiresAt,
    DocumentDI.passportCardIssuingState,
    DocumentDI.passportCardIssuingCountry,
    DocumentDI.passportCardRefNumber,
    DocumentDI.passportCardNationality,
    DocumentDI.passportCardClassifiedDocumentType,
    DocumentDI.passportCardCurp,
    DocumentDI.passportCardCurpValidationResponse,
  ],
};

type GetDocDIsProps = {
  dis: string[]; // | DataIdentifier[], although we ruin typesafety by adding to the dis array
  documents?: Document[];
  vaultData?: Partial<Record<DataIdentifier, VaultValue>>;
};

const getDocDis = ({ dis, documents, vaultData }: GetDocDIsProps) => {
  Object.entries(mainDIs).forEach(([mainDi, idDocType]) => {
    // main DI is something like id_card.front.latest_upload or passport.latest_upload
    if (dis.includes(mainDi as DataIdentifier)) {
      const associatedDocuments = filterDocumentsByKind(documents, idDocType);
      associatedDocuments.forEach(document => {
        const { completedVersion, uploads } = document;
        const extractedDIs = extractedDIsBase[idDocType];
        // get the extracted DIs for each document
        extractedDIs?.forEach(di => {
          if (
            vaultData &&
            !isVaultDataEmpty(vaultData[di]) &&
            completedVersion
          ) {
            if (di.includes(RawJsonKinds.CurpValidationResponse)) {
              const curpVersion = document.curpCompletedVersion ?? '';
              const versionedCurpDI = curpVersion ? `${di}:${curpVersion}` : di;
              dis.push(versionedCurpDI);
            }
            dis.push(`${di}:${completedVersion}`);
          }
        });
        // get the specific upload images for each document
        uploads.forEach(upload => {
          const { version, identifier } = upload;
          const di = `${identifier}:${version}`;
          dis.push(di);
        });
      });
    }
  });

  return dis as DataIdentifier[];
};

export default getDocDis;
