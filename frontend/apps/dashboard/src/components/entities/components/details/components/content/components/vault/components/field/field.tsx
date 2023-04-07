import { useTranslation } from '@onefootprint/hooks';
import {
  DataIdentifier,
  isVaultDataDecrypted,
  VaultValue,
} from '@onefootprint/types';
import { Box, Checkbox, Tooltip, Typography } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FieldOrPlaceholder } from 'src/components';
import styled, { css } from 'styled-components';

export type FieldProps = {
  canDecrypt: boolean;
  disabled: boolean;
  label: string;
  name: DataIdentifier;
  showCheckbox: boolean;
  value: VaultValue;
  hint?: string;
  renderValue?: () => React.ReactNode;
  renderLabel?: () => React.ReactNode;
};

const Field = ({
  canDecrypt,
  disabled,
  label,
  name,
  showCheckbox,
  value,
  hint,
  renderValue,
  renderLabel,
}: FieldProps) => {
  const { t } = useTranslation('pages.entity.decrypt');
  const { register } = useFormContext();
  const isDataDecrypted = isVaultDataDecrypted(value);

  return (
    <Container role="row" aria-label={label}>
      {showCheckbox ? (
        <Tooltip disabled={canDecrypt} position="right" text={t('not-allowed')}>
          <Box>
            <Checkbox
              checked={isDataDecrypted || undefined}
              {...register(name)}
              disabled={disabled}
              label={label}
              hint={hint}
            />
          </Box>
        </Tooltip>
      ) : (
        <LabelContainer>
          {renderLabel ? (
            renderLabel()
          ) : (
            <Typography variant="body-3" color="tertiary">
              {label}
            </Typography>
          )}
          {hint && (
            <Typography variant="caption-2" color="secondary">
              {hint}
            </Typography>
          )}
        </LabelContainer>
      )}
      {renderValue ? renderValue() : <FieldOrPlaceholder data={value} />}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column wrap;
  justify-content: space-between;
`;

const LabelContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[2]};
    flex-direction: column;
  `};
`;

export default Field;
