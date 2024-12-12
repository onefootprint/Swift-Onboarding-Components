import useEntityVault from '@/entities/hooks/use-entity-vault';
import type { WithEntityProps } from '@/entity/components/with-entity';
import type { Icon } from '@onefootprint/icons';
import { DataKind, isVaultDataDecrypted } from '@onefootprint/types';
import { CodeInline, LinkButton, Text } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getCustomDIs } from 'src/components/entities/utils/get-dis';

import { cx } from 'class-variance-authority';
import { AnimatePresence, motion } from 'framer-motion';
import useDecryptForm from '../../hooks/use-decrypt-form';
import useField from '../../hooks/use-field';
import type { DiField } from '../../vault.types';
import Field from '../field';
import { useDecryptControls } from '../vault-actions';
import CustomDocumentField from './components/custom-document-field';
import ShowMoreButton from './components/show-more-button';

type CustomDataFieldsProps = WithEntityProps & {
  iconComponent: Icon;
  title: string;
};

const CustomDataFields = ({ entity, iconComponent: IconComponent, title }: CustomDataFieldsProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'fieldset',
  });
  const decrypt = useDecryptControls();
  const decryptForm = useDecryptForm();
  const getFieldProps = useField(entity);
  const { data: vaultWithTransforms } = useEntityVault(entity.id, entity);
  const { vault: vaultData, dataKinds } = vaultWithTransforms || {};
  const customDIs = getCustomDIs(vaultData || {});
  const selectableFields = customDIs.filter(di => getFieldProps(di).canSelect);
  const allSelected = selectableFields.every(decryptForm.isChecked);
  const shouldShowSelectAll = decrypt.inProgress && selectableFields.length > 0;
  const [showAllCta, setShowAllCta] = useState(false);

  const NUMBER_OF_FIELDS_TO_SHOW = 8;
  const shouldShowShowMore = customDIs.length > NUMBER_OF_FIELDS_TO_SHOW;
  const initialFields = customDIs.slice(0, NUMBER_OF_FIELDS_TO_SHOW);
  const additionalFields = customDIs.slice(NUMBER_OF_FIELDS_TO_SHOW);

  const handleSelectAll = () => {
    decryptForm.set(selectableFields, true);
  };

  const handleDeselectAll = () => {
    decryptForm.set(selectableFields, false);
  };

  const containerVariants = {
    hidden: { opacity: 0, height: 0, transition: { duration: 0.2 } },
    show: {
      opacity: 1,
      height: 'auto',
      transition: {
        height: { duration: 0.3 },
        opacity: { duration: 0.2 },
        staggerChildren: 0.05,
      },
    },
  };

  const listItemVariants = {
    hidden: { opacity: 0, x: -5 },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'tween',
        duration: 0.15,
        ease: 'easeOut',
      },
    },
  };

  const renderField = (field: DiField) => {
    const isDecrypted = isVaultDataDecrypted(vaultData?.[field.di]);
    const isDocument = dataKinds?.[field.di] === DataKind.documentData;

    if (isDecrypted && isDocument) {
      return (
        <motion.div key={field.di} variants={listItemVariants} layout="position">
          <CustomDocumentField field={field} entity={entity} />
        </motion.div>
      );
    }

    return (
      <motion.div key={field.di} variants={listItemVariants} layout="position">
        <Field
          key={field.di}
          renderLabel={() => <CodeInline disabled>{field.di}</CodeInline>}
          di={field.di}
          entity={entity}
        />
      </motion.div>
    );
  };

  return vaultData ? (
    <div className="flex flex-col overflow-hidden border border-solid rounded border-tertiary">
      <div className="flex justify-between px-5 py-2 border-b border-solid border-tertiary rounded-t-md bg-secondary">
        <div className="flex items-center gap-2">
          <IconComponent />
          <Text variant="label-3">{title}</Text>
        </div>
        {shouldShowSelectAll && (
          <LinkButton onClick={allSelected ? handleDeselectAll : handleSelectAll}>
            {allSelected ? t('deselect-all') : t('select-all')}
          </LinkButton>
        )}
      </div>
      <div className={cx('flex flex-col gap-3 p-5', { 'pb-0': shouldShowShowMore })}>
        <motion.div layout className="flex flex-col gap-3">
          {initialFields.map(di => renderField({ di }))}
        </motion.div>

        <AnimatePresence mode="wait" initial={false}>
          {showAllCta && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="flex flex-col gap-3"
              layout
            >
              {additionalFields.map(di => renderField({ di }))}
            </motion.div>
          )}
        </AnimatePresence>
        {shouldShowShowMore && (
          <ShowMoreButton
            showAllCta={showAllCta}
            onClick={() => setShowAllCta(!showAllCta)}
            count={`${t('actions.more-fields', { count: customDIs.length - NUMBER_OF_FIELDS_TO_SHOW })}`}
          >
            {showAllCta ? t('actions.show-less') : t('actions.show-all')}
          </ShowMoreButton>
        )}
      </div>
    </div>
  ) : null;
};

export default CustomDataFields;
