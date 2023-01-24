import { useTranslation } from '@onefootprint/hooks';
import { OrgRole, OrgRoleScope } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import createTagList from 'src/utils/create-tag-list';

export type RowProps = OrgRole;

const Row = ({ scopes, name, createdAt }: RowProps) => {
  const { t } = useTranslation('pages.settings.roles.scopes');
  // TODO: Add translation for decrypt
  const tags = scopes.map((scope: OrgRoleScope) => t(scope));

  return (
    <>
      <td>
        <Typography variant="body-3">{name}</Typography>
      </td>
      <td>
        <Typography variant="body-3">{createdAt}</Typography>
      </td>
      <td>
        {scopes.includes('admin') ? (
          <Typography variant="body-3">{t('admin')}</Typography>
        ) : (
          createTagList(tags)
        )}
      </td>
    </>
  );
};
export default Row;
