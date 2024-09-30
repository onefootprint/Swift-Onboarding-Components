import type React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { EDIT_VAULT_FORM_ID } from '@/entity/constants';

import type { VaultValue } from '@onefootprint/types';
import isPlainObject from 'lodash/isPlainObject';
import { useEffect } from 'react';
import useEditControls from '../../../../hooks/use-edit-controls';
import type { EditFormData } from '../../edit-vault-drawer.types';

export type EditFormProps = {
  children: React.ReactNode;
  onSubmit: (formData: Record<string, VaultValue>) => void;
};

const EditForm = ({ children, onSubmit }: EditFormProps) => {
  const formMethods = useForm<EditFormData>();
  const { reset, handleSubmit } = formMethods;
  const editControls = useEditControls();

  useEffect(() => {
    if (editControls.isIdle) {
      reset();
    }
  }, [editControls.isIdle]);

  const handleBeforeSubmit = (formValues: EditFormData) => {
    onSubmit(flattenObject(formValues) as Record<string, VaultValue>);
  };

  return (
    <form id={EDIT_VAULT_FORM_ID} onSubmit={handleSubmit(handleBeforeSubmit)}>
      <FormProvider {...formMethods}>{children}</FormProvider>
    </form>
  );
};

const flattenObject = (
  obj: Record<string, unknown>,
  parentKey: string = '',
  sep: string = '.',
): Record<string, unknown> => {
  const toReturn: Record<string, unknown> = {};

  Object.keys(obj).forEach(key => {
    const newKey = parentKey ? `${parentKey}${sep}${key}` : key;
    if (isPlainObject(obj[key])) {
      const flatObject = flattenObject(obj[key] as Record<string, unknown>, newKey, sep);
      Object.keys(flatObject).forEach(x => {
        toReturn[x] = flatObject[x] as EditFormData;
      });
    } else {
      toReturn[newKey] = obj[key] as EditFormData;
    }
  });

  return toReturn;
};

export default EditForm;
