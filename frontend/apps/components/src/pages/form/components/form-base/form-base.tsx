import type { FootprintVariant } from '@onefootprint/footprint-js';
import { FootprintPrivateEvent } from '@onefootprint/footprint-js';
import { DEFAULT_COUNTRY } from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import { IcoBuilding24, IcoCreditcard24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Divider, useConfirmationDialog } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useEffectOnce } from 'usehooks-ts';

import { useFootprintProvider } from '../../../../components/footprint-provider';
import type { AddressData, PartialAddressData } from './components/address';
import Address, { PartialAddress } from './components/address';
import type { CardData } from './components/card';
import Card from './components/card';
import FormDialog from './components/form-dialog';
import type { NameData } from './components/name';
import Name from './components/name';
import Title from './components/title';

export type FormVariant = 'card' | 'name' | 'fullAddress' | 'partialAddress';

export type FormData =
  | CardData
  | (CardData & NameData)
  | (CardData & NameData & AddressData)
  | (CardData & PartialAddressData);

export type FormBaseProps = {
  title?: string;
  sections: FormVariant[];
  variant?: FootprintVariant;
  isLoading?: boolean;
  onSave?: (data: FormData) => void;
  onCancel?: () => void;
  onClose?: () => void;
  hideFootprintLogo?: boolean;
  hideButtons?: boolean;
};

const FORM_ID = 'secure-form';

const FormBase = ({
  title,
  sections,
  variant = 'modal',
  isLoading,
  onSave,
  onCancel,
  onClose,
  hideFootprintLogo,
  hideButtons,
}: FormBaseProps) => {
  const footprintProvider = useFootprintProvider();

  const { t } = useTranslation('pages.secure-form');
  const confirmationDialog = useConfirmationDialog();
  const hasCountry =
    sections.includes('fullAddress') || sections.includes('partialAddress');
  const defaultValues = hasCountry ? { country: DEFAULT_COUNTRY } : undefined;
  const methods = useForm<FormData>({ defaultValues });
  const {
    handleSubmit,
    formState: { isDirty, errors },
    trigger,
    getValues,
  } = methods;

  const triggerSave = () => {
    trigger();
    if (Object.values(errors).length > 0) {
      // There were some errors with inputs, don't trigger saving
      return;
    }
    const data = getValues();
    onSave?.(data);
  };

  useEffectOnce(() => {
    footprintProvider.on(FootprintPrivateEvent.formSaved, triggerSave);
  });

  const confirmClose = (callback?: () => void) => {
    if (!callback) {
      return;
    }
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

  if (!sections.length) {
    return null;
  }

  const renderSections = () => {
    const content = [];
    if (sections.includes('name') || sections.includes('card')) {
      content.push(
        <Title
          key="card-title"
          label={t('section-title.card-information')}
          iconComponent={<IcoCreditcard24 />}
        />,
      );
    }
    if (sections.includes('name')) {
      content.push(<Name key="name" />);
    }
    if (sections.includes('card')) {
      content.push(<Card key="card" />);
    }
    if (
      sections.includes('fullAddress') ||
      sections.includes('partialAddress')
    ) {
      content.push(<StyledDivider key="address-divider" />);
      content.push(
        <Title
          key="address-title"
          label={t('section-title.billing-address')}
          iconComponent={<IcoBuilding24 />}
        />,
      );
    }
    if (sections.includes('fullAddress')) {
      content.push(<Address key="address" />);
    } else if (sections.includes('partialAddress')) {
      content.push(<PartialAddress key="address" />);
    }
    return content;
  };

  return (
    <FormDialog
      title={title}
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
          onClick: () => confirmClose(onCancel),
          disabled: isLoading,
        }
      }
      onClose={() => confirmClose(onClose)}
      hideFootprintLogo={hideFootprintLogo}
      hideButtons={hideButtons}
    >
      <FormProvider {...methods}>
        <StyledForm id={FORM_ID} onSubmit={handleSubmit(handleBeforeSubmit)}>
          {renderSections()}
        </StyledForm>
      </FormProvider>
    </FormDialog>
  );
};

const StyledForm = styled.form`
  ${({ theme }) => css`
    margin: ${theme.spacing[2]};
    display: grid;
    row-gap: ${theme.spacing[5]};
  `}
`;

const StyledDivider = styled(Divider)`
  ${({ theme }) => css`
    margin: ${theme.spacing[4]} 0;
  `}
`;

export default FormBase;
