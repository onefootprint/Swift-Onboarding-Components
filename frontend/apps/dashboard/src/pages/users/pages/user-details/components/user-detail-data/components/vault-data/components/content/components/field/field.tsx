import { useTranslation } from '@onefootprint/hooks';
import { Box, Checkbox, Tooltip, Typography } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FieldOrPlaceholder } from 'src/components';
import styled from 'styled-components';

export type FieldProps = {
  canAccess: boolean;
  canSelect: boolean;
  isDataDecrypted: boolean;
  hasPermission: boolean;
  hasValue: boolean;
  label: string;
  name: string;
  showCheckbox: boolean;
  value?: string | null;
};

const Field = ({
  canAccess,
  canSelect,
  isDataDecrypted,
  hasPermission,
  hasValue,
  label,
  name,
  showCheckbox,
  value,
}: FieldProps) => {
  const { t } = useTranslation('pages.user-details.user-info.decrypt');
  const { register } = useFormContext();
  const disabled = !canSelect;
  const showTooltip = disabled;

  const getTooltip = () => {
    if (!hasPermission || !canAccess) {
      return t('not-allowed');
    }
    if (!hasValue) {
      return t('empty');
    }
    return undefined;
  };

  return (
    <Container role="row" aria-label={label}>
      {showCheckbox ? (
        <Tooltip disabled={!showTooltip} text={getTooltip()}>
          <Box>
            <Checkbox
              checked={isDataDecrypted || undefined}
              {...register(name)}
              disabled={disabled}
              label={label}
            />
          </Box>
        </Tooltip>
      ) : (
        <Typography variant="body-3" color="tertiary">
          {label}
        </Typography>
      )}
      <FieldOrPlaceholder data={value} />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column wrap;
  justify-content: space-between;
`;

export default Field;
