import { DocumentDI } from '@onefootprint/types';
import { useTranslation } from 'react-i18next';

const useDocumentFields = () => {
  const { t } = useTranslation('common', { keyPrefix: 'di' });

  const fields = [
    {
      main: DocumentDI.latestIdCardFront,
      label: t(DocumentDI.latestIdCardFront),
      dis: [
        DocumentDI.latestIdCardFront,
        DocumentDI.latestIdCardBack,
        DocumentDI.latestIdCardSelfie,
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
      ],
    },
    {
      main: DocumentDI.latestDriversLicenseFront,
      label: t(DocumentDI.latestDriversLicenseFront),
      dis: [
        DocumentDI.latestDriversLicenseFront,
        DocumentDI.latestDriversLicenseBack,
        DocumentDI.latestDriversLicenseSelfie,
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
      ],
    },
    {
      main: DocumentDI.latestPassport,
      label: t(DocumentDI.latestPassport),
      dis: [
        DocumentDI.latestPassport,
        DocumentDI.latestPassportSelfie,
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
      ],
    },
    {
      main: DocumentDI.latestVisa,
      label: t(DocumentDI.latestVisa),
      dis: [
        DocumentDI.latestVisa,
        DocumentDI.latestVisaSelfie,
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
      ],
    },
    {
      main: DocumentDI.latestResidenceDocumentFront,
      label: t(DocumentDI.latestResidenceDocumentFront),
      dis: [
        DocumentDI.latestResidenceDocumentFront,
        DocumentDI.latestResidenceDocumentBack,
        DocumentDI.latestResidenceDocumentSelfie,
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
      ],
    },
    {
      main: DocumentDI.latestWorkPermitFront,
      label: t(DocumentDI.latestWorkPermitFront),
      dis: [
        DocumentDI.latestWorkPermitFront,
        DocumentDI.latestWorkPermitBack,
        DocumentDI.latestWorkPermitSelfie,
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
      ],
    },
    {
      main: DocumentDI.latestVoterIdentificationFront,
      label: t(DocumentDI.latestVoterIdentificationFront),
      dis: [
        DocumentDI.latestVoterIdentificationFront,
        DocumentDI.latestVoterIdentificationBack,
        DocumentDI.latestVoterIdentificationSelfie,
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
      ],
    },
    {
      main: DocumentDI.latestSsnCardFront,
      label: t(DocumentDI.latestSsnCardFront),
      dis: [DocumentDI.latestSsnCardFront],
    },
    {
      main: DocumentDI.latestLeaseFront,
      label: t(DocumentDI.latestLeaseFront),
      dis: [DocumentDI.latestLeaseFront],
    },
    {
      main: DocumentDI.latestBankStatementFront,
      label: t(DocumentDI.latestBankStatementFront),
      dis: [DocumentDI.latestBankStatementFront],
    },
    {
      main: DocumentDI.latestUtilityBillFront,
      label: t(DocumentDI.latestUtilityBillFront),
      dis: [DocumentDI.latestUtilityBillFront],
    },
  ];

  return fields;
};

export default useDocumentFields;
