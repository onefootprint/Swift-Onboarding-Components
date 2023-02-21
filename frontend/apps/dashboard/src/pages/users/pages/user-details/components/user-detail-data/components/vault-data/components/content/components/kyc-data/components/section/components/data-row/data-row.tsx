import { useTranslation } from '@onefootprint/hooks';
import { Box, Checkbox, Tooltip, Typography } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import FieldOrPlaceholder from 'src/pages/users/components/field-or-placeholder';
import styled from 'styled-components';

export type DataRowProps = {
  canAccess: boolean;
  canSelect: boolean;
  hasDataInVault: boolean;
  hasPermission: boolean;
  isFilled: boolean;
  label: string;
  name: string;
  showCheckbox: boolean;
  value?: string | null;
};

const DataRow = ({
  canAccess,
  canSelect,
  hasDataInVault,
  hasPermission,
  isFilled,
  label,
  name,
  showCheckbox,
  value,
}: DataRowProps) => {
  const { t } = useTranslation('pages.user-details.user-info.decrypt');
  const { register } = useFormContext();
  const disabled = !canSelect;
  const showTooltip = disabled;

  const getTooltip = () => {
    if (!hasPermission || !canAccess) {
      return t('not-allowed');
    }
    if (!isFilled) {
      return t('empty');
    }
    return '';
  };

  return (
    <Container role="row" aria-label={label}>
      {showCheckbox ? (
        <Tooltip disabled={!showTooltip} text={getTooltip()}>
          <Box>
            <Checkbox
              checked={hasDataInVault || undefined}
              {...(hasDataInVault ? {} : register(name))}
              disabled={disabled}
              label={label}
            />
          </Box>
        </Tooltip>
      ) : (
        <Typography variant="label-3" color="tertiary">
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

export default DataRow;
