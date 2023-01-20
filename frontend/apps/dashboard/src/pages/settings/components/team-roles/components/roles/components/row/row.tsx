import { useTranslation } from '@onefootprint/hooks';
import { OrgRole, OrgRoleScope } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import createTagList from 'src/utils/create-tag-list';

type RowProps = OrgRole;

const Row = ({ scopes, name, createdAt }: RowProps) => {
  const { t } = useTranslation('pages.settings.roles');
  // TODO: Add translation for decrypt
  const tags = scopes.map((scope: OrgRoleScope) => t(`scopes.${scope}`));

  return (
    <>
      <td>
        <Typography variant="body-3">{name}</Typography>
      </td>
      <td>
        <Typography variant="body-3">{createdAt}</Typography>
      </td>
      <td>
        <Typography variant="body-3">{createTagList(tags)}</Typography>
      </td>
    </>
  );
};
export default Row;
