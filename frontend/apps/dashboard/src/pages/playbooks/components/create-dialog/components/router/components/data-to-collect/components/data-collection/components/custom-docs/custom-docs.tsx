import type { CustomDoc, DataToCollectFormData } from '@/playbooks/utils/machine/types';
import { IcoPlusSmall16 } from '@onefootprint/icons';
import { Box, LinkButton, Stack, Text } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import CustomDocsForm from './components/custom-docs-form';

const CustomDocs = () => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.data-to-collect.custom-docs',
  });
  const { t: allT } = useTranslation('common');
  const { control } = useFormContext<DataToCollectFormData>();
  const [formIndex, setFormIndex] = useState<number | null>(null);
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'personal.additionalDocs.custom',
  });

  const handleAdd = () => {
    const length = fields.length;
    // @ts-ignore: identifier should be CustomDI, however, in this case, we want to init an empty value
    append({ name: '', description: '', identifier: '' });
    setFormIndex(length);
  };

  const handleEdit = (index: number) => () => {
    setFormIndex(index);
  };

  const handleDelete = (index: number) => {
    remove(index);
    setFormIndex(null);
  };

  const handleCancel = (index: number, meta: { isCreating: boolean; isValid: boolean }) => {
    setFormIndex(null);
    if (meta.isCreating && !meta.isValid) {
      remove(index);
    }
  };

  const handleSubmit = (index: number, customDoc: CustomDoc) => {
    update(index, customDoc);
    setFormIndex(null);
  };

  return (
    <Stack gap={3} direction="column">
      <Stack gap={2} direction="column">
        <Text variant="body-3">{t('title')}</Text>
        <Text variant="body-3" color="tertiary">
          {t('description')}
        </Text>
      </Stack>
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
                {allT('edit')}
              </LinkButton>
            </Stack>
          ))}
          <LinkButton iconComponent={IcoPlusSmall16} iconPosition="left" variant="label-4" onClick={handleAdd}>
            {allT('add')}
          </LinkButton>
        </Stack>
      ) : (
        <CustomDocsForm index={formIndex} onCancel={handleCancel} onDelete={handleDelete} onSubmit={handleSubmit} />
      )}
    </Stack>
  );
};

export default CustomDocs;
