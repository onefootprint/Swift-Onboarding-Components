import type { DataIdentifier, Entity, VaultValue } from '@onefootprint/types';
import { Box, Checkbox, Form, Text, Tooltip } from '@onefootprint/ui';
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
  renderValue?: (value: VaultValue, isValueDecrypted: boolean) => React.ReactNode;
  skipRegisterFieldToDecryptForm?: boolean;
};

const Field = ({ di, entity, hint, renderValue, renderLabel, skipRegisterFieldToDecryptForm }: FieldProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'decrypt' });
  const { register } = useFormContext();
  const field = useField(entity)(di);
  const decrypt = useDecryptControls();
  const customLabel = renderLabel ? renderLabel() : undefined;
  const label = customLabel ?? field.label;
  const ariaLabel = typeof customLabel === 'string' ? customLabel : field.label;
  const isChecked = field.isDecrypted || decrypt.inProgressDecryptingAll;
  const registerField = skipRegisterFieldToDecryptForm || !decrypt.inProgress ? undefined : register(field.name);

  const labelDisplay = (
    <Text variant="body-3" color="tertiary">
      {label}
    </Text>
  );

  return (
    <Container role="row" aria-label={ariaLabel}>
      <Form.Field variant="horizontal">
        {field.showCheckbox ? (
          <Tooltip
            disabled={field.canDecrypt}
            position="right"
            text={field.isEmpty ? t('empty-not-allowed', { field: field.label }) : t('not-allowed')}
          >
            <Box>
              <Checkbox
                checked={isChecked || undefined}
                {...registerField}
                disabled={field.disabled}
                label={labelDisplay}
                hint={hint}
              />
            </Box>
          </Tooltip>
        ) : (
          <LabelContainer>
            {customLabel && React.isValidElement(customLabel) ? customLabel : labelDisplay}
            {hint && (
              <Text variant="caption-2" color="secondary">
                {hint}
              </Text>
            )}
          </LabelContainer>
        )}
        <ValueContainer>
          <FieldValue field={field} renderValue={renderValue} />
        </ValueContainer>
      </Form.Field>
    </Container>
  );
};

const Container = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const LabelContainer = styled(Form.Label)`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[2]};
    flex-direction: column;
    max-width: 50%;
  `};
`;

const ValueContainer = styled(Box)`
  max-width: 50%;
`;

export default Field;
