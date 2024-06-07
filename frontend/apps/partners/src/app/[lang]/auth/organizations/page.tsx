import type { Metadata } from 'next';
import React from 'react';

import { getPartnerAuthRoles } from '@/queries';

import OrganizationsPageContent from './content';

export const metadata: Metadata = {
  title: 'Footprint - Select an Organization',
};

type OrganizationsPageProps = { searchParams: { token: string } };

const OrganizationsPage = async ({ searchParams: { token } }: OrganizationsPageProps) => {
  const orgs = await getPartnerAuthRoles(token);

  return <OrganizationsPageContent token={token} orgs={orgs} />;
};

export default OrganizationsPage;
