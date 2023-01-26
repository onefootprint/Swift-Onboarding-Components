import { useTranslation } from '@onefootprint/hooks';
import { OrgRole, OrgRoleScope } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import createTagList from 'src/utils/create-tag-list';

import Actions from './components/actions';

export type RowProps = OrgRole;

const Row = ({ id, scopes, name, createdAt, isImmutable }: RowProps) => {
  const { t } = useTranslation('pages.settings.roles');
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
        {scopes.includes('admin') ? (
          <Typography variant="body-3">{t('scopes.admin')}</Typography>
        ) : (
          createTagList(tags)
        )}
      </td>
      <td>{isImmutable ? null : <Actions id={id} name={name} />}</td>
    </>
  );
};

export default Row;
