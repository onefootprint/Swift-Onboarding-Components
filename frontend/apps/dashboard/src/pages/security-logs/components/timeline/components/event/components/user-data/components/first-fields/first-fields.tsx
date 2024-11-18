import type { DataIdentifier } from '@onefootprint/request-types/dashboard';
import { Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import { MAX_VISIBLE_FIELDS } from '../../constants';

type FirstFieldsTextProps = {
  fields: string[];
};

const FirstFieldsText = ({ fields }: FirstFieldsTextProps) => {
  const { t } = useTranslation('security-logs', { keyPrefix: 'events.user-data' });
  const { t: allT } = useTranslation('common', { keyPrefix: 'di' });

  const getFieldText = () => {
    const translatedFields = fields.map(field => allT(field as DataIdentifier));

    if (translatedFields.length === 1) return translatedFields[0];
    if (translatedFields.length === 2) return `${translatedFields[0]} ${t('and')} ${translatedFields[1]}`;

    const displayFields = translatedFields.slice(0, MAX_VISIBLE_FIELDS);
    const lastField = displayFields.pop();

    return fields.length <= MAX_VISIBLE_FIELDS
      ? `${displayFields.join(', ')}, ${t('and')} ${lastField}`
      : `${displayFields.join(', ')}, ${lastField} ${t('and')}`;
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
