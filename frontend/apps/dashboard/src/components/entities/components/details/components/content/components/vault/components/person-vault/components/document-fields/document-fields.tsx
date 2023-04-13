import { DocumentDI, isVaultDataDecrypted } from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import React from 'react';

import useEntityVault from '@/entities/hooks/use-entity-vault';
import { WithEntityProps } from '@/entity/components/with-entity';

import Field from '../../../field';
import DocumentField from './components/document-field';

type DocumentFieldsProps = WithEntityProps;

const DocumentFields = ({ entity }: DocumentFieldsProps) => {
  const { data } = useEntityVault(entity.id, entity);
  const fields = [
    {
      main: DocumentDI.idCardFront,
      label: 'Id card',
      dis: [
        DocumentDI.idCardFront,
        DocumentDI.idCardBack,
        DocumentDI.idCardSelfie,
      ],
    },
    {
      main: DocumentDI.driversLicenseFront,
      label: 'Drivers license',
      dis: [
        DocumentDI.driversLicenseFront,
        DocumentDI.driversLicenseBack,
        DocumentDI.driversLicenseSelfie,
      ],
    },
    {
      main: DocumentDI.passport,
      label: 'Passport',
      dis: [DocumentDI.passport, DocumentDI.passportSelfie],
    },
  ];

  return (
    <Box>
      {fields.map(field =>
        entity.attributes.includes(field.main) ? (
          <Box key={field.label}>
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
