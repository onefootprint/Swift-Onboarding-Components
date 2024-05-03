import {
  type DataIdentifier,
  type Entity,
  type VaultValue,
} from '@onefootprint/types';
import { Box, Checkbox, Text, Tooltip } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import useField from '../../hooks/use-field';
import { useDecryptControls } from '../vault-actions';
import FieldValue from './components/field-value';

export type FieldProps = {
  di: DataIdentifier;
  entity: Entity;
  hint?: string;
  renderLabel?: () => React.ReactNode;
  renderValue?: (
    value: VaultValue,
    isValueDecrypted: boolean,
  ) => React.ReactNode;
  status?: React.ReactNode;
  skipRegisterFieldToDecryptForm?: boolean;
};

const Field = ({
  di,
  entity,
  hint,
  renderValue,
  renderLabel,
  status,
  skipRegisterFieldToDecryptForm,
}: FieldProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.entity.decrypt' });
  const { register } = useFormContext();
  const field = useField(entity)(di);
  const decrypt = useDecryptControls();
  const customLabel = renderLabel ? renderLabel() : undefined;
  const label = customLabel ?? field.label;
  const ariaLabel = typeof customLabel === 'string' ? customLabel : field.label;
  const isChecked = field.isDecrypted || decrypt.inProgressDecryptingAll;
  const registerField = skipRegisterFieldToDecryptForm
    ? undefined
    : register(field.name);

  return (
    <Container role="row" aria-label={ariaLabel}>
      {field.showCheckbox ? (
        <Tooltip
          disabled={field.canDecrypt}
          position="right"
          text={t('not-allowed')}
        >
          <Box>
            <Checkbox
              checked={isChecked || undefined}
              {...registerField}
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
            <LabelAndStatusContainer>
              <Text variant="body-3" color="tertiary" tag="label">
                {label}
              </Text>
              {status}
            </LabelAndStatusContainer>
          )}
          {hint && (
            <Text variant="caption-2" color="secondary">
              {hint}
            </Text>
          )}
        </LabelContainer>
      )}
      <FieldValue field={field} renderValue={renderValue} />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column wrap;
  justify-content: space-between;
  align-items: center;
`;

const LabelContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[2]};
    flex-direction: column;
  `};
`;

const LabelAndStatusContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[3]};
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  `};
`;

export default Field;
