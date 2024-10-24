import { IcoLock16 } from '@onefootprint/icons';
import { type Document, type Entity, SupportedIdDocTypes } from '@onefootprint/types';
import { Checkbox, LinkButton, Stack, Text, Tooltip } from '@onefootprint/ui';
import { format } from 'date-fns';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useIdDocText from 'src/hooks/use-id-doc-text';
import useDocumentField from '../../hooks/use-document-upload-field';
import useDocumentsFilters from '../../hooks/use-documents-filters';
import type { UploadWithDocument } from '../../types';
import DocumentStatusBadge from '../document-status-badge';

export type UploadItemProps = {
  entity: Entity;
  upload: UploadWithDocument;
};

const UploadItem = ({ entity, upload }: UploadItemProps) => {
  const { t } = useTranslation('entity-details');
  const { register } = useFormContext();
  const field = useDocumentField(entity)(upload);
  const filters = useDocumentsFilters();

  const { timestamp, identifier, document, documentId } = upload;

  const handleClick = () => {
    filters.push({ document_id: documentId });
  };

  return (
    <>
      <Stack justify="space-between">
        {field.showCheckbox ? (
          <Tooltip disabled={field.canDecrypt} position="right" text={t('decrypt.not-allowed')}>
            <Checkbox
              checked={field.isChecked || undefined}
              {...register(`documents.${document.kind}`)} // TODO: change decryption, now individual uploads are selected to be decrypted, not entire document kinds
              label={<UploadInfo timestamp={timestamp} identifier={identifier} document={document} />}
              disabled={field.disabled}
            />
          </Tooltip>
        ) : (
          <UploadInfo timestamp={timestamp} identifier={identifier} document={document} />
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

type UploadInfoProps = {
  timestamp: string;
  identifier: string;
  document: Omit<Document, 'uploads'>;
};

const UploadInfo = ({ timestamp, identifier, document }: UploadInfoProps) => {
  const getDocText = useIdDocText();
  return (
    <Stack align="center" gap={3}>
      <Text variant="snippet-3" color="tertiary">
        {format(new Date(timestamp), 'MM/dd/yy h:mma')}
      </Text>
      <Text tag="span" variant="label-3">
        ⋅
      </Text>
      <Text variant="snippet-2">
        {document.kind === SupportedIdDocTypes.custom ? identifier : getDocText(document.kind)}
      </Text>
      <DocumentStatusBadge document={document} />
    </Stack>
  );
};

export default UploadItem;
