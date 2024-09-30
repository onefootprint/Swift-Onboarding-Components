import { type DataIdentifier, type Entity, InvestorProfileDI } from '@onefootprint/types';
import { Form, Text, TextInput, Tooltip } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import { FIELD_VALUE_WIDTH } from '../../constants';
import useEditField from '../../hooks/use-edit-field';
import ErrorOrHint from '../edit-field/components/error-or-hint';
import Editable from '../editable';

export type EditInvestorProfileFieldProps = {
  di: DataIdentifier;
  entity: Entity;
};

const EditInvestorProfileField = ({ di, entity }: EditInvestorProfileFieldProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'header-default.actions.edit-vault-drawer.fieldsets',
  });
  const field = useEditField(entity)(di);
  const { label, value, canEdit, isDecrypted, isEmpty } = field;
  const encryptedText = <Text variant="body-2">{t('investor-profile.encrypted')}</Text>;

  // Occupation and Employer fields are in one section. If either is encrypted and non-empty, show whole section as encrypted
  const occupationField = useEditField(entity)(InvestorProfileDI.occupation);
  const employerField = useEditField(entity)(InvestorProfileDI.employer);
  if (di === InvestorProfileDI.occupation) {
    if (!employerField.isDecrypted && !employerField.isEmpty) {
      return encryptedText;
    }
  }
  if (di === InvestorProfileDI.employer) {
    if (!occupationField.isDecrypted && !occupationField.isEmpty) {
      return null;
    }
  }

  const renderValue = () => {
    if (isDecrypted || isEmpty) {
      // TODO: in future add the declaration fields and display their values, even if not editable
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
    return encryptedText;
  };

  return (
    <Form.Field>
      {label ? (
        <Form.Label>
          <Text variant="caption-1">{label}</Text>
        </Form.Label>
      ) : (
        <></>
      )}
      {renderValue()}
      <ErrorOrHint entity={entity} fieldName={di} />
    </Form.Field>
  );
};

export default EditInvestorProfileField;
