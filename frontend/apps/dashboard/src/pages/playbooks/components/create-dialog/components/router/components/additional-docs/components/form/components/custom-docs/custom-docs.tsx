import type { CustomDoc, DataToCollectFormData } from '@/playbooks/utils/machine/types';
import { IcoPencil16, IcoPlusSmall16 } from '@onefootprint/icons';
import { Box, LinkButton, Stack, Text } from '@onefootprint/ui';
import { useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CustomDocsForm, CustomDocsPreview } from '../../../../../custom-docs';

const CustomDocs = () => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.custom-docs',
  });
  const { t: allT } = useTranslation('common');
  const { control } = useFormContext<DataToCollectFormData>();
  const [formIndex, setFormIndex] = useState<number | null>(null);
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'person.docs.additional.custom',
  });

  const handleAdd = () => {
    const length = fields.length;
    append({ name: '', description: '', identifier: '', uploadSettings: 'prefer_upload' });
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
    <Stack gap={5} direction="column">
      <Stack gap={2} direction="column">
        <Text variant="body-3">{t('title')}</Text>
        <Text variant="body-3" color="tertiary">
          {t('description')}
        </Text>
      </Stack>
      {formIndex == null ? (
        <Stack direction="column" gap={5}>
          {fields.map((field, index) => (
            <Box
              borderRadius="sm"
              borderWidth={1}
              padding={5}
              borderStyle="solid"
              borderColor="tertiary"
              key={field.id}
            >
              <Stack gap={5} flexDirection="column">
                <Stack gap={3} alignItems="center" justifyContent="space-between">
                  <Text variant="label-3">{t('form.title')}</Text>
                  <LinkButton
                    variant="label-3"
                    onClick={handleEdit(index)}
                    iconPosition="left"
                    iconComponent={IcoPencil16}
                  >
                    {allT('edit')}
                  </LinkButton>
                </Stack>
                <CustomDocsPreview
                  identifier={field.identifier}
                  uploadSettings={field.uploadSettings}
                  name={field.name}
                  gap={3}
                />
              </Stack>
            </Box>
          ))}
          <LinkButton iconComponent={IcoPlusSmall16} iconPosition="left" variant="label-3" onClick={handleAdd}>
            {allT('add')}
          </LinkButton>
        </Stack>
      ) : (
        <CustomDocsForm
          formName="person.docs.additional.custom"
          index={formIndex}
          onCancel={handleCancel}
          onDelete={handleDelete}
          onSubmit={handleSubmit}
        />
      )}
    </Stack>
  );
};

export default CustomDocs;
