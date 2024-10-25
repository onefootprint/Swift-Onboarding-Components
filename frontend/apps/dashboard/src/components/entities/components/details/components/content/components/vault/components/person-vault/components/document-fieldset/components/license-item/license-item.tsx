import { IcoLock16 } from '@onefootprint/icons';
import type { Document, Entity, EntityVault, SupportedIdDocTypes } from '@onefootprint/types';
import { Checkbox, LinkButton, Stack, Text, Tooltip } from '@onefootprint/ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useDocumentField from '../../hooks/use-document-field';
import useDocumentsFilters from '../../hooks/use-documents-filters';
import ItemLabel from '../item-label';

export type LicenseItemProps = {
  document: Document;
  entity: Entity;
  onDecrypt: (documentKind: SupportedIdDocTypes) => void;
  vault: EntityVault;
};

const LicenseItem = ({ document, entity, vault }: LicenseItemProps) => {
  const { t } = useTranslation('entity-details');
  const { register } = useFormContext();
  const field = useDocumentField(entity, vault)(document);
  const filters = useDocumentsFilters();

  const { startedAt, kind } = document;
  const documentId = startedAt ? `${kind}-${startedAt}` : kind;

  const handleClick = () => {
    filters.push({ document_id: documentId });
  };

  return (
    <>
      <Stack justify="space-between">
        {field.showCheckbox ? (
          <Tooltip disabled={field.isDecryptable} position="right" text={t('decrypt.not-allowed')}>
            <Checkbox
              checked={field.isChecked || undefined}
              {...register(`documents.${kind}`)}
              label={
                <ItemLabel
                  document={document}
                  timestamp={startedAt || ''}
                  title={t('fieldset.documents.details.license-and-selfie')}
                />
              }
              disabled={field.disabled}
            />
          </Tooltip>
        ) : (
          <ItemLabel
            document={document}
            timestamp={startedAt || ''}
            title={t('fieldset.documents.details.license-and-selfie')}
          />
        )}
        {field.isDecrypted ? (
          <LinkButton onClick={handleClick}>{t('fieldset.documents.see-details')}</LinkButton>
        ) : (
          <Stack align="center" gap={2}>
            <IcoLock16 />
            <Text variant="body-3">•••••••••</Text>
          </Stack>
        )}
      </Stack>
    </>
  );
};

export default LicenseItem;
