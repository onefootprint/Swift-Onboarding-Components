import { useTranslation } from '@onefootprint/hooks';
import { DataIdentifier, Entity } from '@onefootprint/types';
import { Box, Checkbox, Tooltip, Typography } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FieldOrPlaceholder } from 'src/components';
import styled, { css } from 'styled-components';

import useField from '../../hooks/use-field';

export type FieldProps = {
  di: DataIdentifier;
  entity: Entity;
  hint?: string;
  renderLabel?: () => React.ReactNode;
  renderValue?: () => React.ReactNode;
};

const Field = ({ di, entity, hint, renderValue, renderLabel }: FieldProps) => {
  const { t } = useTranslation('pages.entity.decrypt');
  const { register } = useFormContext();
  const field = useField(entity);
  const {
    canDecrypt,
    disabled,
    isDecrypted,
    label,
    name,
    showCheckbox,
    value,
  } = field(di);

  return (
    <Container role="row" aria-label={label}>
      {showCheckbox ? (
        <Tooltip disabled={canDecrypt} position="right" text={t('not-allowed')}>
          <Box>
            <Checkbox
              checked={isDecrypted || undefined}
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
