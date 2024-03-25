import type { Member } from '@onefootprint/types';
import React from 'react';

import SettingsPageContent from './content';

const members: Member[] = [
  {
    id: 'orguser_0WFrWMZwP0C65s21w9lBBy',
    email: 'jane@onefootprint.com',
    firstName: 'John',
    lastName: 'Doe',
    role: {
      createdAt: '2022-09-19T16:24:34.368337Z',
      id: 'Role_aExxJ6XgSBpvqIJ2VcHH6J',
      isImmutable: true,
      name: 'Admin',
      numActiveUsers: 1,
      numActiveApiKeys: 0,
      scopes: [], // @ts-ignore
      kind: 'dashboard_user',
    },
    rolebinding: { lastLoginAt: '2023-01-18T17:54:10.668420Z' },
  },
  {
    id: 'orguser_0WFrWMZwP0C65s21w9lBBy',
    email: 'jane@onefootprint.com',
    firstName: 'John',
    lastName: 'Doe',
    role: {
      createdAt: '2022-09-19T16:24:34.368337Z',
      id: 'Role_aExxJ6XgSBpvqIJ2VcHH6J',
      isImmutable: true,
      name: 'Admin',
      numActiveUsers: 1,
      numActiveApiKeys: 0,
      scopes: [], // @ts-ignore
      kind: 'dashboard_user',
    },
    rolebinding: { lastLoginAt: '2023-01-18T17:54:10.668420Z' },
  },
];

const SettingsPage = () => <SettingsPageContent members={members} />;

export default SettingsPage;
