import type { WithEntityProps } from '@/entity/components/with-entity';
import useEntitySeqno from '@/entity/hooks/use-entity-seqno';
import { IcoFileText16 } from '@onefootprint/icons';
import { Divider, LinkButton, Text } from '@onefootprint/ui';
import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import useDecryptForm from '../../../../hooks/use-decrypt-form';
import useField from '../../../../hooks/use-field';
import type { DiField } from '../../../../vault.types';
import RiskSignalsOverview from '../../../risk-signals-overview';
import { useDecryptControls } from '../../../vault-actions';
import Content from './components/content';

export type DocumentFieldsetProps = WithEntityProps & {
  fields: DiField[];
};

const DocumentFieldset = ({ entity, fields }: DocumentFieldsetProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'fieldset',
  });
  const isViewingHistorical = Boolean(useEntitySeqno());
  const decrypt = useDecryptControls();
  const decryptForm = useDecryptForm();
  const dis = fields.map(field => field.di);
  const getFieldProps = useField(entity);
  const selectableFields = dis.filter(di => getFieldProps(di).canSelect);
  const allSelected = selectableFields.every(decryptForm.isChecked);
  const shouldShowSelectAll = decrypt.inProgress && selectableFields.length > 0;

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
        {
          'bg-primary': isViewingHistorical,
        },
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
          <Text variant="label-3" tag="h2">
            {t('documents.title')}
          </Text>
        </div>
        {shouldShowSelectAll && (
          <LinkButton onClick={allSelected ? handleDeselectAll : handleSelectAll}>
            {allSelected ? t('deselect-all') : t('select-all')}
          </LinkButton>
        )}
      </header>
      <div className="flex flex-col gap-5 p-5 pb-4">
        <Content entity={entity} />
        <footer className="flex flex-col gap-4">
          <Divider />
          <RiskSignalsOverview type="document" />
        </footer>
      </div>
    </fieldset>
  );
};

export default DocumentFieldset;
