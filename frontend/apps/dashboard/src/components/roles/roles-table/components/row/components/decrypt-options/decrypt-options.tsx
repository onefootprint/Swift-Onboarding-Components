import { Tag } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import type { DecryptOption } from 'src/components/roles';

export type DecryptOptionProps = {
  options: DecryptOption[];
  as?: React.ElementType;
};

const DecryptOptions = ({ options }: DecryptOptionProps) => {
  const { t } = useTranslation('roles');

  if (options.length > 0) {
    const fields = options.map(scope => t(`scopes.decrypt.${scope}` as ParseKeys<'common'>)).join(', ');
    return (
      <Tag>
        {t('scopes.decrypt_fields_one', {
          count: options.length,
          field: fields,
        })}
      </Tag>
    );
  }
  return null;
};

export default DecryptOptions;
