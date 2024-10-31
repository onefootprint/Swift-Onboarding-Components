import { Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

type FirstFieldsTextProps = {
  decryptedFields: string[];
};

const FirstFieldsText = ({ decryptedFields }: FirstFieldsTextProps) => {
  const { t } = useTranslation('common');

  const getFieldText = () => {
    if (decryptedFields.length <= 3) {
      return decryptedFields.reduce((acc, field, index) => {
        const translatedField = t(`di.${field}`);
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
    return firstThreeFields.map(field => t(`di.${field}`)).join(', ');
  };

  const text = getFieldText();
  return <Text variant="label-3">{text}</Text>;
};

export default FirstFieldsText;
