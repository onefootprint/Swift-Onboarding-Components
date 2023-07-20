import { useTranslation } from '@onefootprint/hooks';
import { DocumentDI, isVaultDataDecrypted } from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import React from 'react';

import useEntityVault from '@/entities/hooks/use-entity-vault';
import { WithEntityProps } from '@/entity/components/with-entity';

import Field from '../../../field';
import DocumentField from './components/document-field';

type DocumentFieldsProps = WithEntityProps;

const DocumentFields = ({ entity }: DocumentFieldsProps) => {
  const { t } = useTranslation('di');
  const { data } = useEntityVault(entity.id, entity);
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

  return (
    <Box>
      {fields.map(field =>
        entity.attributes.includes(field.main) ? (
          <Box key={field.main}>
            {isVaultDataDecrypted(data?.[field.main]) ? (
              <DocumentField
                label={field.label}
                entity={entity}
                dis={field.dis}
              />
            ) : (
              <Field di={field.main} entity={entity} />
            )}
          </Box>
        ) : null,
      )}
    </Box>
  );
};
export default DocumentFields;
