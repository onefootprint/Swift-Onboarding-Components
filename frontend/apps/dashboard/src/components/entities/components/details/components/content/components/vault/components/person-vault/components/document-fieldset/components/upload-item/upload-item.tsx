import { IcoLock16 } from '@onefootprint/icons';
import { type Entity, type EntityVault, SupportedIdDocTypes } from '@onefootprint/types';
import { Checkbox, LinkButton, Stack, Text, Tooltip } from '@onefootprint/ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useIdDocText from 'src/hooks/use-id-doc-text';
import useDocumentsFilters from '../../hooks/use-documents-filters';
import useUploadField from '../../hooks/use-upload-field';
import type { UploadWithDocument } from '../../types';
import ItemLabel from '../item-label';
import UploadDetails from '../upload-details';

export type UploadItemProps = {
  entity: Entity;
  upload: UploadWithDocument;
  vault: EntityVault;
  onDecrypt: (documentKind: SupportedIdDocTypes) => void;
};

const UploadItem = ({ entity, upload, vault, onDecrypt }: UploadItemProps) => {
  const { t } = useTranslation('entity-details');
  const { register } = useFormContext();
  const field = useUploadField(entity, vault)(upload);
  const { timestamp, identifier, document, documentId } = upload;
  const getDocText = useIdDocText();
  const title = document.kind === SupportedIdDocTypes.custom ? identifier : getDocText(document.kind);
  const filters = useDocumentsFilters();
  const open = filters.query.document_id === documentId;

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
              {...register(`documents.${document.kind}`)}
              label={<ItemLabel document={document} timestamp={timestamp} title={title} />}
              disabled={field.disabled}
            />
          </Tooltip>
        ) : (
          <ItemLabel document={document} timestamp={timestamp} title={title} />
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
      {open && (
        <UploadDetails
          isDecryptable={field.isDecryptable}
          open={open}
          title={title}
          upload={upload}
          vault={vault}
          onDecrypt={onDecrypt}
        />
      )}
    </>
  );
};

export default UploadItem;
