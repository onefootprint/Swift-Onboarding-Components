import type { DataIdentifier, Entity } from '@onefootprint/types';
import { Form, Shimmer, TextInput, Tooltip } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import useDecryptControls from '../../../../hooks/use-decrypt-controls';
import { FIELD_VALUE_HEIGHT, FIELD_VALUE_WIDTH } from '../../constants';
import useEditField from '../../hooks/use-edit-field';
import Editable from '../editable';
import EncryptedInput from './components/encrypted-input';
import ErrorOrHint from './components/error-or-hint';

export type EditFieldProps = {
  di: DataIdentifier;
  entity: Entity;
  beneficialOwnerValue?: string | number;
};

const EditField = ({ di, entity, beneficialOwnerValue }: EditFieldProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'header-default.actions.edit-vault-drawer.fieldsets' });
  const field = useEditField(entity)(di, beneficialOwnerValue);
  const { label, value, canEdit, isDecrypted, isEmpty } = field;
  const decryptControls = useDecryptControls();

  const renderValue = () => {
    if (decryptControls.inProgressDecryptingAll) {
      return <Shimmer height={FIELD_VALUE_HEIGHT} width={FIELD_VALUE_WIDTH} />;
    }
    if (isDecrypted || isEmpty) {
      return canEdit ? (
        <Editable entity={entity} value={value} fieldName={di} />
      ) : (
        <Tooltip text={t('not-allowed')} position="left">
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
    <tr className="[&>div]:items-start" aria-label={label ?? di}>
      <Form.Field variant="horizontal">
        <div className="flex items-center h-8 max-w-[75%]">
          <Form.Label>
            <p className="text-body-3 text-tertiary">{label}</p>
          </Form.Label>
        </div>
        <div className="flex flex-col items-start flex-1 max-w-[220px]">
          {renderValue()}
          <ErrorOrHint entity={entity} fieldName={di} />
        </div>
      </Form.Field>
    </tr>
  );
};

export default EditField;
