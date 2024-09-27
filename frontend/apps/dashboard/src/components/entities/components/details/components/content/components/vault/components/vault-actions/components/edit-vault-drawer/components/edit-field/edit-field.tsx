import type { DataIdentifier, Entity } from '@onefootprint/types';
import { Box, Form, Text, TextInput, Tooltip } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { FIELD_VALUE_WIDTH } from '../../constants';
import useEditField from '../../hooks/use-edit-field';
import Editable from '../editable';
import EncryptedInput from '../encrypted-input';

export type EditFieldProps = {
  di: DataIdentifier;
  entity: Entity;
};

const EditField = ({ di, entity }: EditFieldProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'header-default.actions.edit-vault-drawer.fieldsets',
  });
  const field = useEditField(entity)(di);
  const { label, value, canEdit, isDecrypted, isEmpty } = field;

  const renderValue = () => {
    if (isDecrypted || isEmpty) {
      return canEdit ? (
        <Editable value={value} fieldName={di as DataIdentifier} />
      ) : (
        <Tooltip text={t('not-allowed')} position="bottom">
          <TextInput
            size="compact"
            placeholder=""
            disabled
            defaultValue={(value as string) ?? '-'}
            width={FIELD_VALUE_WIDTH}
          />
        </Tooltip>
      );
    }
    return <EncryptedInput />;
  };

  return (
    <Container role="row" aria-label={label}>
      <Form.Field variant="horizontal">
        <LabelContainer>
          <Text variant="body-3" color="tertiary">
            {label}
          </Text>
        </LabelContainer>
        <Box maxWidth="70%">{renderValue()}</Box>
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
    max-width: 75%;
  `};
`;

export default EditField;
