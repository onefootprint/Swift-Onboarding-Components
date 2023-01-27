import { useTranslation } from '@onefootprint/hooks';
import { OrgRole, OrgRoleScope } from '@onefootprint/types';
import React from 'react';
import createTagList from 'src/utils/create-tag-list';

import Actions from './components/actions';

export type RowProps = {
  role: OrgRole;
};

const Row = ({ role }: RowProps) => {
  const { t } = useTranslation('pages.settings.roles');
  const { name, scopes, isImmutable, createdAt, numActiveUsers } = role;
  const tags = scopes.map((scope: OrgRoleScope) => t(`scopes.${scope}`));

  return (
    <>
      <td>{name}</td>
      <td>{numActiveUsers}</td>
      <td>
        {scopes.includes('admin') ? t('scopes.admin') : createTagList(tags)}
      </td>
      <td>{createdAt}</td>
      <td>{isImmutable ? null : <Actions role={role} />}</td>
    </>
  );
};

export default Row;
