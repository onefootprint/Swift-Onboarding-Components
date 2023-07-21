import { useTranslation } from '@onefootprint/hooks';
import {
  DocumentDI,
  EntityVault,
  isVaultDataDecrypted,
} from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import React from 'react';
import useDocuments from 'src/components/entities/components/details/hooks/use-documents';
import useSession from 'src/hooks/use-session';

import useEntityVault from '@/entities/hooks/use-entity-vault';
import { WithEntityProps } from '@/entity/components/with-entity';

import Field from '../../../field';
import DocumentField from './components/document-field';
import DocumentFieldNew from './components/document-field-new';
import { filterDocumentsByKind, getDocumentKind } from './utils';

type DocumentFieldsProps = WithEntityProps;

const DocumentFields = ({ entity }: DocumentFieldsProps) => {
  const { t } = useTranslation('di');
  const {
    data: { user },
  } = useSession();
  const { data: vault } = useEntityVault(entity.id, entity);
  const { data: documents } = useDocuments(entity.id);

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
          <Box key={field.main} sx={{ paddingBottom: 4 }}>
            {/* eslint-disable-next-line no-nested-ternary */}
            {isVaultDataDecrypted(vault?.[field.main]) ? (
              user?.isFirmEmployee ? (
                <DocumentFieldNew
                  label={field.label}
                  vault={vault ?? ({} as EntityVault)}
                  documentKind={getDocumentKind(field.main)}
                  documents={filterDocumentsByKind(
                    documents ?? [],
                    getDocumentKind(field.main),
                  )}
                />
              ) : (
                <DocumentField
                  label={field.label}
                  entity={entity}
                  dis={field.dis}
                />
              )
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
