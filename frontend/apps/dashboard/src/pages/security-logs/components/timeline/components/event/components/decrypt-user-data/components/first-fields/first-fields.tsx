import type { DataIdentifier } from '@onefootprint/request-types/dashboard';
import { Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

type FirstFieldsTextProps = {
  decryptedFields: string[];
};

const FirstFieldsText = ({ decryptedFields }: FirstFieldsTextProps) => {
  const { t } = useTranslation('common');
  const { t: allT } = useTranslation('common', { keyPrefix: 'di' });

  const getFieldText = () => {
    if (decryptedFields.length <= 3) {
      return decryptedFields.reduce((acc, field, index) => {
        const translatedField = allT(field as DataIdentifier);
        if (decryptedFields.length === 1) {
          return translatedField;
        }
        if (decryptedFields.length === 2) {
          return index === 0 ? translatedField : `${acc} and ${translatedField}`;
        }
        if (index === decryptedFields.length - 1) {
          return `${acc}, and ${translatedField}`;
        }
        return index === 0 ? translatedField : `${acc}, ${translatedField}`;
      }, '');
    }

    const firstThreeFields = decryptedFields.slice(0, 3);
    return `${firstThreeFields.map(field => allT(field as DataIdentifier)).join(', ')} ${t('and')}`;
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
