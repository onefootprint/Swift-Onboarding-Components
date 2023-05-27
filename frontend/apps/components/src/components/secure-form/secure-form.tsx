import { useTranslation } from '@onefootprint/hooks';
import { IcoBuilding24, IcoCreditcard24 } from '@onefootprint/icons';
import { Divider } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import Address, { AddressData } from './components/address';
import Card, { CardData } from './components/card';
import FormDialog from './components/form-dialog';
import Name, { NameData } from './components/name';
import Title from './components/title';

export enum SecureFormType {
  cardOnly = 'cardOnly',
  cardAndName = 'cardAndName',
  cardAndNameAndAddress = 'cardAndNameAndAddress',
}

export type SecureFormData =
  | CardData
  | (CardData & NameData)
  | (CardData & NameData & AddressData);

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
  title,
  type = SecureFormType.cardAndName,
  variant = 'modal',
  onSave,
  onCancel,
  onClose,
}: SecureFormProps) => {
  const { t } = useTranslation('components.secure-form');
  const handleBeforeSubmit = (data: SecureFormData) => {
    onSave?.(data);
  };

  const methods = useForm<SecureFormData>();
  const { handleSubmit } = methods;

  return (
    <FormDialog
      title={title ?? t('title')}
      variant={variant}
      primaryButton={{
        form: FORM_ID,
        label: t('buttons.save'),
        type: 'submit',
      }}
      secondaryButton={
        onCancel && {
          label: t('buttons.cancel'),
          type: 'reset',
          onClick: onCancel,
        }
      }
      onClose={onClose}
    >
      <FormProvider {...methods}>
        <Form id={FORM_ID} onSubmit={handleSubmit(handleBeforeSubmit)}>
          {type === SecureFormType.cardOnly && (
            <>
              <Title
                label={t('section-title.card-information')}
                iconComponent={<IcoCreditcard24 />}
              />
              <Card />
            </>
          )}
          {type === SecureFormType.cardAndName && (
            <>
              <Title
                label={t('section-title.card-information')}
                iconComponent={<IcoCreditcard24 />}
              />
              <Name />
              <Card />
            </>
          )}
          {type === SecureFormType.cardAndNameAndAddress && (
            <>
              <Title
                label={t('section-title.card-information')}
                iconComponent={<IcoCreditcard24 />}
              />
              <Name />
              <Card />
              <StyledDivider />
              <Title
                label={t('section-title.billing-address')}
                iconComponent={<IcoBuilding24 />}
              />
              <Address />
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

const StyledDivider = styled(Divider)`
  ${({ theme }) => css`
    margin: ${theme.spacing[4]} 0;
  `}
`;

export default SecureForm;
