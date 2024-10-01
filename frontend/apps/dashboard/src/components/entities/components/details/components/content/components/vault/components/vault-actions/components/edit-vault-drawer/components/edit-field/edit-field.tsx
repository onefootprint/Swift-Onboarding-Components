import type { DataIdentifier, Entity } from '@onefootprint/types';
import { Form, Stack, Text, TextInput, Tooltip } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { FIELD_VALUE_WIDTH } from '../../constants';
import useEditField from '../../hooks/use-edit-field';
import Editable from '../editable';
import EncryptedInput from './components/encrypted-input';
import ErrorOrHint from './components/error-or-hint';

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
        <Editable entity={entity} value={value} fieldName={di as DataIdentifier} />
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
    <Container role="row" aria-label={label ?? di}>
      <Form.Field variant="horizontal">
        <LabelContainer>
          <Form.Label>
            <Text variant="body-3" color="tertiary">
              {label}
            </Text>
          </Form.Label>
        </LabelContainer>
        <Stack direction="column" align="flex-start" flex={1} maxWidth={FIELD_VALUE_WIDTH}>
          {renderValue()}
          <ErrorOrHint entity={entity} fieldName={di} />
        </Stack>
      </Form.Field>
    </Container>
  );
};

const Container = styled.div`
  > div {
    align-items: flex-start;
  }
`;

const LabelContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    height: ${theme.spacing[8]};
    max-width: 75%;
  `};
`;

export default EditField;
