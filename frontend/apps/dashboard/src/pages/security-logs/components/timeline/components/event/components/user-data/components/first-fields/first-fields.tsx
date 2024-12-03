import { Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

type FirstFieldsTextProps = {
  fields: string[];
  hasCollapsedFields?: boolean;
};

const FirstFieldsText = ({ fields, hasCollapsedFields }: FirstFieldsTextProps) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.user-data' });

  const getFieldText = () => {
    if (fields.length === 1) return fields[0];
    if (fields.length === 2) return `${fields[0]} ${t('and')} ${fields[1]}`;

    const allFields = [...fields];
    const lastField = allFields.pop();

    return hasCollapsedFields
      ? `${allFields.join(', ')}, ${lastField}, ${t('and')}`
      : `${allFields.join(', ')}, ${t('and')} ${lastField}`;
  };

  const text = getFieldText();
  return (
    <>
      {/* NOTE: we split these into parts so that we can wrap these across multiple 
      lines in the parent container  */}
      {text.split(', ').map((part, index, array) => (
        <Text key={`${part}`} variant="label-3" wordWrap="break-word">
          {part}
          {index < array.length - 1 ? ',' : ''}
        </Text>
      ))}
    </>
  );
};

export default FirstFieldsText;
