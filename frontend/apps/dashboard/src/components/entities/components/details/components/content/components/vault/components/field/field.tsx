import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import {
  DataIdentifier,
  Entity,
  isVaultDataDecrypted,
  VaultValue,
} from '@onefootprint/types';
import { Box, Checkbox, Tooltip, Typography } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FieldOrPlaceholder } from 'src/components';

import useField from '../../hooks/use-field';

export type FieldProps = {
  di: DataIdentifier;
  entity: Entity;
  hint?: string;
  renderLabel?: () => React.ReactNode;
  renderValue?: (
    value: VaultValue,
    isValueDecrypted: boolean,
  ) => React.ReactNode;
};

const Field = ({ di, entity, hint, renderValue, renderLabel }: FieldProps) => {
  const { t } = useTranslation('pages.entity.decrypt');
  const { register } = useFormContext();
  const field = useField(entity)(di);
  const customLabel = renderLabel ? renderLabel() : undefined;
  const label = typeof customLabel === 'string' ? customLabel : field.label;

  return (
    <Container role="row" aria-label={label}>
      {field.showCheckbox ? (
        <Tooltip
          disabled={field.canDecrypt}
          position="right"
          text={t('not-allowed')}
        >
          <Box>
            <Checkbox
              checked={field.isDecrypted || undefined}
              {...register(field.name)}
              disabled={field.disabled}
              label={label}
              hint={hint}
            />
          </Box>
        </Tooltip>
      ) : (
        <LabelContainer>
          {customLabel && React.isValidElement(customLabel) ? (
            customLabel
          ) : (
            <Typography variant="body-3" color="tertiary" as="label">
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
      {renderValue ? (
        renderValue(field.value, isVaultDataDecrypted(field.value))
      ) : (
        <FieldOrPlaceholder data={field.value} />
      )}
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
