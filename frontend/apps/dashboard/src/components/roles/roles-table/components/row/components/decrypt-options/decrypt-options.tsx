import { useTranslation } from '@onefootprint/hooks';
import { Tooltip } from '@onefootprint/ui';
import React from 'react';
import type { DecryptOption } from 'src/components/roles';

export type DecryptOptionProps<T extends React.ElementType> = {
  options: DecryptOption[];
  as?: T;
};

const DecryptOptions = <T extends React.ElementType>({
  options,
  as,
}: DecryptOptionProps<T>) => {
  const { t } = useTranslation('pages.settings.roles');
  const Component = as || 'span';
  if (options.length === 1) {
    return (
      <Component>
        {t(`scopes.decrypt_fields_one`, {
          count: 1,
          field: t(`scopes.decrypt.${options[0]}`),
        })}
      </Component>
    );
  }
  if (options.length > 1) {
    return (
      <Tooltip
        text={options.map(scope => t(`scopes.decrypt.${scope}`)).join(', ')}
      >
        <Component>
          {t(`scopes.decrypt_fields_other`, {
            count: options.length,
          })}
        </Component>
      </Tooltip>
    );
  }
  return null;
};

export default DecryptOptions;
