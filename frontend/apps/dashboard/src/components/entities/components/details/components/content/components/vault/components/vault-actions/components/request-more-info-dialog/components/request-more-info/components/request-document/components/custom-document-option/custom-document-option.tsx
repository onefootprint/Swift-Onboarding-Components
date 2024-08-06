import { IcoPlusSmall16, IcoTrash16 } from '@onefootprint/icons';
import { Checkbox, LinkButton, Stack } from '@onefootprint/ui';
import type { ChangeEvent } from 'react';
import { useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import AnimatedContainer from 'src/components/animated-container';
import CustomDocRequestForm from 'src/components/custom-doc-request-form';

import { RequestMoreInfoKind } from '../../../../types';

const CustomDocumentOption = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.actions.request-more-info.form.document.custom-document',
  });
  const { register, watch, control, unregister, trigger } = useFormContext();
  const {
    fields: customDocumentFields,
    append: addCustomDocument,
    remove: removeCustomDocument,
  } = useFieldArray({
    control,
    name: 'customDocument',
    rules: {
      minLength: 1,
    },
  });
  const triggerKinds = watch('kinds');
  const { name, onBlur, onChange, ref } = register('kinds');

  const handleCustomDocumentChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event);
    if (event.target.checked && customDocumentFields.length === 0) {
      addCustomDocument({});
    } else {
      customDocumentFields.forEach((_, index) => removeCustomDocument(index));
    }
  };

  const handleRemoveCustomDocument = async (index: number) => {
    removeCustomDocument(index);
    await trigger();
  };

  useEffect(() => {
    // Unregister custom document field after remove to remove the error state associated with the field
    // This is due to a bug in react-hook-form where the error state is not removed
    // https://github.com/orgs/react-hook-form/discussions/9875
    unregister(`customDocument.${customDocumentFields.length}.customDocumentName`);
    unregister(`customDocument.${customDocumentFields.length}.customDocumentIdentifier`);
    unregister(`customDocument.${customDocumentFields.length}.customDocumentDescription`);
  }, [customDocumentFields.length, unregister]);

  return (
    <>
      <Checkbox
        label={t('title')}
        value={RequestMoreInfoKind.CustomDocument}
        name={name}
        onBlur={onBlur}
        onChange={handleCustomDocumentChange}
        ref={ref}
      />
      <AnimatedContainer isExpanded={triggerKinds.includes(RequestMoreInfoKind.CustomDocument)}>
        <Stack direction="column" gap={7}>
          {customDocumentFields.map((field, index) => (
            <Stack key={field.id} direction="column" gap={5}>
              <Stack
                direction="column"
                gap={5}
                padding={5}
                marginLeft={7}
                marginRight={7}
                borderRadius="default"
                borderStyle="solid"
                borderWidth={1}
                borderColor="primary"
              >
                <CustomDocRequestForm
                  customDocNameFormField={`customDocument.${index}.customDocumentName`}
                  customDocIdentifierFormField={`customDocument.${index}.customDocumentIdentifier`}
                  customDocDescriptionFormField={`customDocument.${index}.customDocumentDescription`}
                />
              </Stack>
              {customDocumentFields.length > 1 && index < customDocumentFields.length - 1 && (
                <LinkButton
                  onClick={() => handleRemoveCustomDocument(index)}
                  iconComponent={IcoTrash16}
                  $marginLeft={7}
                  iconPosition="left"
                  destructive
                >
                  {t('remove')}
                </LinkButton>
              )}
            </Stack>
          ))}
        </Stack>
        <LinkButton
          onClick={() => addCustomDocument({})}
          iconComponent={IcoPlusSmall16}
          iconPosition="left"
          $marginTop={5}
          $marginLeft={7}
        >
          {t('add-another')}
        </LinkButton>
      </AnimatedContainer>
    </>
  );
};

export default CustomDocumentOption;
