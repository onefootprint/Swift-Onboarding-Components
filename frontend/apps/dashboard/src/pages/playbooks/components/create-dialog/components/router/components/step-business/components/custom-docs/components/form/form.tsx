import type { CustomDoc, DataToCollectFormData } from '@/playbooks/utils/machine/types';
import { IcoPlusSmall16 } from '@onefootprint/icons';
import { Box, LinkButton, Stack, Text } from '@onefootprint/ui';
import React, { useEffect, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import CustomDocsForm from './components/custom-docs-form';

type CustomProps = {
  onClose: () => void;
};

const CustomDocs = ({ onClose }: CustomProps) => {
  const { t } = useTranslation('common');
  const { control } = useFormContext<DataToCollectFormData>();
  const [formIndex, setFormIndex] = useState<number | null>(null);
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'business.docs.custom',
  });

  useEffect(() => {
    if (fields.length === 0) {
      handleAdd();
    }
  }, []);

  const handleAdd = () => {
    const length = fields.length;
    append({ name: '', description: '', identifier: '' });
    setFormIndex(length);
  };

  const handleEdit = (index: number) => () => {
    setFormIndex(index);
  };

  const handleDelete = (index: number) => {
    const shouldCancel = fields.length === 1;
    remove(index);
    setFormIndex(null);

    if (shouldCancel) {
      onClose();
    }
  };

  const handleCancel = (index: number, meta: { isCreating: boolean; isValid: boolean }) => {
    if (meta.isCreating && !meta.isValid) {
      remove(index);
      if (fields.length === 1) {
        onClose();
      }
    }
    setFormIndex(null);
  };

  const handleSubmit = (index: number, customDoc: CustomDoc) => {
    update(index, customDoc);
    setFormIndex(null);
  };

  return fields.length > 0 ? (
    <Stack gap={3} direction="column">
      {formIndex == null ? (
        <Stack direction="column" gap={5}>
          {fields.map((field, index) => (
            <Stack key={field.id} justifyContent="space-between" gap={5}>
              <Stack gap={3} alignItems="center" overflow="hidden">
                <Text variant="label-4">{field.name}</Text>
                <Box
                  backgroundColor="secondary"
                  borderColor="tertiary"
                  borderRadius="sm"
                  borderStyle="solid"
                  borderWidth={1}
                  overflow="hidden"
                  paddingBlock={1}
                  paddingInline={2}
                  textOverflow="ellipsis"
                  userSelect="none"
                  whiteSpace="nowrap"
                >
                  <Text variant="snippet-2" color="tertiary" truncate>
                    document.custom.{field.identifier}
                  </Text>
                </Box>
              </Stack>
              <LinkButton variant="label-4" onClick={handleEdit(index)}>
                {t('edit')}
              </LinkButton>
            </Stack>
          ))}
          <LinkButton iconComponent={IcoPlusSmall16} iconPosition="left" variant="label-4" onClick={handleAdd}>
            {t('add')}
          </LinkButton>
        </Stack>
      ) : (
        <CustomDocsForm index={formIndex} onCancel={handleCancel} onDelete={handleDelete} onSubmit={handleSubmit} />
      )}
    </Stack>
  ) : null;
};

export default CustomDocs;
