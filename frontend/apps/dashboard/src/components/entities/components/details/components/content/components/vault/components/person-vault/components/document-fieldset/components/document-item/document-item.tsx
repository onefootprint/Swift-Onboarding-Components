import { IcoLock16 } from '@onefootprint/icons';
import { type Document, type Entity, type EntityVault, SupportedIdDocTypes } from '@onefootprint/types';
import { Checkbox, LinkButton, Tooltip } from '@onefootprint/ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useIdDocText from 'src/hooks/use-id-doc-text';
import useDocumentField from '../../hooks/use-document-field';
import useDocumentsFilters from '../../hooks/use-documents-filters';
import Details from '../details';
import ItemLabel from './components/item-label';

export type DocumentItemProps = {
  document: Document;
  entity: Entity;
  onDecrypt: (documentKind: SupportedIdDocTypes) => void;
  vault: EntityVault;
};

const DocumentItem = ({ document, entity, vault, onDecrypt }: DocumentItemProps) => {
  const { t } = useTranslation('entity-details');
  const { register } = useFormContext();
  const field = useDocumentField(entity, vault)(document);
  const { startedAt, kind, uploads } = document;
  const getDocText = useIdDocText();
  const title = kind === SupportedIdDocTypes.custom ? uploads[0].identifier : getDocText(kind);

  const documentId = startedAt ? `${kind}-${startedAt}` : kind;
  const filters = useDocumentsFilters();
  const open = filters.query.document_id === documentId;

  const handleClick = () => {
    filters.push({ document_id: documentId });
  };

  return (
    <>
      <div className="flex justify-between">
        {field.showCheckbox ? (
          <Tooltip disabled={field.canSelect} position="right" text={t('decrypt.not-allowed')} asChild>
            <Checkbox
              checked={field.isChecked || undefined}
              {...register(`documents.${kind}`)}
              label={<ItemLabel document={document} timestamp={startedAt || ''} title={title} />}
              disabled={field.disabled}
            />
          </Tooltip>
        ) : (
          <ItemLabel document={document} timestamp={startedAt || ''} title={title} />
        )}
        {field.isDecrypted ? (
          <LinkButton onClick={handleClick}>{t('fieldset.documents.see-details')}</LinkButton>
        ) : (
          <div className="flex items-center gap-1">
            <IcoLock16 />
            <p className="text-body-3">•••••••••</p>
          </div>
        )}
      </div>
      {open && (
        <Details
          isDecryptable={field.isDecryptable}
          isDecrypted={field.isDecrypted}
          document={document}
          open={open}
          onDecrypt={onDecrypt}
          title={title}
          vault={vault}
        />
      )}
    </>
  );
};

export default DocumentItem;
