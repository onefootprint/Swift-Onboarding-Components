import {
  SecureFormType,
  SecureFormVariant,
} from '@onefootprint/footprint-components-js';
import { DEFAULT_COUNTRY } from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import { IcoBuilding24, IcoCreditcard24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Divider, useConfirmationDialog } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import Address, {
  AddressData,
  PartialAddress,
  PartialAddressData,
} from './components/address';
import Card, { CardData } from './components/card';
import FormDialog from './components/form-dialog';
import Name, { NameData } from './components/name';
import Title from './components/title';

export type FormData =
  | CardData
  | (CardData & NameData)
  | (CardData & NameData & AddressData)
  | (CardData & PartialAddressData);

export type FormProps = {
  title?: string;
  type?: SecureFormType;
  variant?: SecureFormVariant;
  isLoading?: boolean;
  onSave?: (data: FormData) => void;
  onCancel?: () => void;
  onClose?: () => void;
};

const FORM_ID = 'secure-form';

const Form = ({
  title,
  type = SecureFormType.cardAndName,
  variant = 'modal',
  isLoading,
  onSave,
  onCancel,
  onClose,
}: FormProps) => {
  const { t } = useTranslation('pages.secure-form');
  const confirmationDialog = useConfirmationDialog();
  const hasCountry =
    type === SecureFormType.cardAndNameAndAddress ||
    type === SecureFormType.cardAndZip;

  const defaultValues = hasCountry
    ? {
        country: DEFAULT_COUNTRY,
      }
    : undefined;
  const methods = useForm<FormData>({
    defaultValues,
  });
  const {
    handleSubmit,
    formState: { isDirty },
  } = methods;

  const confirmClose = (callback: () => void) => {
    if (!isDirty) {
      callback();
      return;
    }
    confirmationDialog.open({
      title: t('confirm-close.title'),
      description: t('confirm-close.description'),
      primaryButton: {
        label: t('confirm-close.buttons.yes'),
        onClick: callback,
      },
      secondaryButton: {
        label: t('confirm-close.buttons.no'),
      },
    });
  };

  const handleBeforeSubmit = (data: FormData) => {
    onSave?.(data);
  };

  const handleClose = () => {
    if (onClose) {
      confirmClose(onClose);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      confirmClose(onCancel);
    }
  };

  return (
    <FormDialog
      title={title ?? t('title')}
      variant={variant}
      primaryButton={{
        form: FORM_ID,
        label: t('buttons.save'),
        type: 'submit',
        loading: isLoading,
      }}
      secondaryButton={
        onCancel && {
          label: t('buttons.cancel'),
          type: 'reset',
          onClick: handleCancel,
          disabled: isLoading,
        }
      }
      onClose={handleClose}
    >
      <FormProvider {...methods}>
        <StyledForm id={FORM_ID} onSubmit={handleSubmit(handleBeforeSubmit)}>
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
          {type === SecureFormType.cardAndZip && (
            <>
              <Title
                label={t('section-title.card-information')}
                iconComponent={<IcoCreditcard24 />}
              />
              <Card />
              <StyledDivider />
              <Title
                label={t('section-title.billing-address')}
                iconComponent={<IcoBuilding24 />}
              />
              <PartialAddress />
            </>
          )}
        </StyledForm>
      </FormProvider>
    </FormDialog>
  );
};

const StyledForm = styled.form`
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

export default Form;
