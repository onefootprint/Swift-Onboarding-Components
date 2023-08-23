import { useTranslation } from '@onefootprint/hooks';
import { IcoTrash24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { CountrySelect, IconButton } from '@onefootprint/ui';
import React from 'react';
import { ControllerRenderProps, FieldValues } from 'react-hook-form';

type CitizenshipFieldProps = {
  field: ControllerRenderProps<FieldValues, `citizenships.${number}`>;
  onChange: (nextValue: object) => void;
  hasDeleteButton?: boolean;
  onDelete?: () => void;
  hasError?: boolean;
  hint?: string;
};

const CitizenshipField = ({
  field,
  onChange,
  hasDeleteButton,
  onDelete,
  hasError,
  hint,
}: CitizenshipFieldProps) => {
  const { t } = useTranslation('pages.legal-status.form');

  const citizenshipSelect = (
    <CountrySelect
      label={t('citizenship.label')}
      onBlur={field.onBlur}
      placeholder={t('citizenship.placeholder')}
      onChange={nextValue => onChange(nextValue)}
      value={field.value}
      hasError={hasError}
      hint={hint}
    />
  );

  if (hasDeleteButton) {
    const deleteButton = (
      <IconButton
        aria-label={t('citizenship.delete-aria')}
        onClick={onDelete}
        testID="citizenship-delete-button"
      >
        <IcoTrash24 color="error" />
      </IconButton>
    );

    return (
      <Container>
        <CountrySelectWrapper>{citizenshipSelect}</CountrySelectWrapper>
        <IconWrapper>{deleteButton}</IconWrapper>
      </Container>
    );
  }

  return citizenshipSelect;
};

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CountrySelectWrapper = styled.div`
  flex-grow: 1;
`;

const IconWrapper = styled.div`
  ${({ theme }) => css`
    min-width: ${theme.spacing[7]};
    padding-top: ${theme.spacing[7]};
    padding-left: ${theme.spacing[4]};
  `}
`;

export default CitizenshipField;
