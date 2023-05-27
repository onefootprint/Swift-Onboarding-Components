import { IcoCreditcard24 } from '@onefootprint/icons';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import Card, { CardData } from './components/card';
import FormDialog from './components/form-dialog';
import Name, { NameData } from './components/name';
import Title from './components/title';

export enum SecureFormType {
  cardOnly = 'cardOnly',
  cardAndName = 'cardAndName',
}

export type SecureFormData = CardData | (CardData & NameData);

export type SecureFormProps = {
  title?: string;
  type?: SecureFormType;
  variant?: 'modal' | 'card';
  onSave?: (data: SecureFormData) => void;
  onCancel?: () => void;
  onClose?: () => void;
};

const FORM_ID = 'secure-form';

const SecureForm = ({
  title = 'Add credit card',
  type = SecureFormType.cardAndName,
  variant = 'modal',
  onSave,
  onCancel,
  onClose,
}: SecureFormProps) => {
  const handleBeforeSubmit = (data: SecureFormData) => {
    onSave?.(data);
  };

  const methods = useForm<SecureFormData>();
  const { handleSubmit } = methods;

  return (
    <FormDialog
      title={title}
      variant={variant}
      primaryButton={{
        form: FORM_ID,
        label: 'Save',
        type: 'submit',
      }}
      secondaryButton={
        onCancel && {
          label: 'Cancel',
          type: 'reset',
          onClick: onCancel,
        }
      }
      onClose={onClose}
    >
      <FormProvider {...methods}>
        <Form id={FORM_ID} onSubmit={handleSubmit(handleBeforeSubmit)}>
          {type === SecureFormType.cardAndName && (
            <>
              <Title
                label="Card Information"
                iconComponent={<IcoCreditcard24 />}
              />
              <Name />
              <Card />
            </>
          )}
          {type === SecureFormType.cardOnly && (
            <>
              <Title
                label="Card Information"
                iconComponent={<IcoCreditcard24 />}
              />
              <Card />
            </>
          )}
        </Form>
      </FormProvider>
    </FormDialog>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[5]};
  `}
`;

export default SecureForm;
