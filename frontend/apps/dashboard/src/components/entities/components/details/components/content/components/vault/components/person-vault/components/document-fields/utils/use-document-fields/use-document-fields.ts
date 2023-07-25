import { useTranslation } from '@onefootprint/hooks';
import { DocumentDI } from '@onefootprint/types';

const useDocumentFields = () => {
  const { t } = useTranslation('di');

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
      ],
    },
  ];

  return fields;
};

export default useDocumentFields;
