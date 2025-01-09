import type { WithEntityProps } from '@/entity/components/with-entity';
import useEntitySeqno from '@/entity/hooks/use-entity-seqno';
import { IcoFileText16 } from '@onefootprint/icons';
import type { DataIdentifier } from '@onefootprint/types';
import { Divider, LinkButton } from '@onefootprint/ui';
import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import useEntityVault from 'src/components/entities/hooks/use-entity-vault';
import useDecryptForm from '../../../../hooks/use-decrypt-form';
import RiskSignalsOverview from '../../../risk-signals-overview';
import { useDecryptControls } from '../../../vault-actions';
import Content from './components/content';
import useDocumentField from './hooks/use-document-field';
import useDocuments from './hooks/use-documents';

export type DocumentFieldsetProps = WithEntityProps;

const DocumentFieldset = ({ entity }: DocumentFieldsetProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'fieldset' });
  const seqno = useEntitySeqno();
  const { data: documents, error } = useDocuments(entity.id, seqno);
  const { data: vaultData, update: updateVault } = useEntityVault(entity.id, entity);
  const vault = vaultData?.vault ?? {};
  const getFieldProps = useDocumentField(entity, vault);
  const decrypt = useDecryptControls();
  const decryptForm = useDecryptForm();
  const selectableFields =
    documents
      ?.filter(document => getFieldProps(document).canSelect)
      .map(({ kind }) => `documents.${kind}` as DataIdentifier) ?? [];
  const shouldShowSelectAll = documents && decrypt.inProgress && selectableFields.length > 0;
  const allSelected = selectableFields.every(di => decryptForm.isChecked(di));
  const isViewingHistorical = Boolean(seqno);

  const handleSelectAll = () => {
    decryptForm.set(selectableFields, true);
  };

  const handleDeselectAll = () => {
    decryptForm.set(selectableFields, false);
  };

  return (
    <fieldset
      aria-label={t('documents.title')}
      className={cx(
        'rounded-md border border-solid rounded border-tertiary flex flex-col w-full h-full justify-between',
        { 'bg-primary': isViewingHistorical },
      )}
    >
      <header
        className={cx('flex justify-between px-5 py-2 border-b border-solid border-tertiary rounded-t-md', {
          'bg-primary': isViewingHistorical,
          'bg-secondary': !isViewingHistorical,
        })}
      >
        <div className="flex items-center gap-3 ">
          <IcoFileText16 />
          <h2 className="text-label-3">{t('documents.title')}</h2>
        </div>
        {shouldShowSelectAll && (
          <LinkButton onClick={allSelected ? handleDeselectAll : handleSelectAll}>
            {allSelected ? t('deselect-all') : t('select-all')}
          </LinkButton>
        )}
      </header>
      <div className="flex flex-col gap-5 p-5 pb-4">
        <Content entity={entity} error={error} documents={documents} updateVault={updateVault} vault={vault} />
        <footer className="flex flex-col gap-4">
          <Divider />
          <RiskSignalsOverview type="document" />
        </footer>
      </div>
    </fieldset>
  );
};

export default DocumentFieldset;
