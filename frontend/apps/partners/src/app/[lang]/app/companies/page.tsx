import { getPartnerPartnerships } from '@/queries';

import CompaniesContent from './content';

const CompaniesPage = async () => {
  const companies = await getPartnerPartnerships();

  return <CompaniesContent companies={companies} />;
};

export default CompaniesPage;
