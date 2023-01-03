import { Organization } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';

type OrganizationItemProps = {
  item: Organization;
};

const OrganizationItem = ({ item }: OrganizationItemProps) => (
  <td>
    <Typography variant="label-2">{item.name}</Typography>
  </td>
);

export default OrganizationItem;
