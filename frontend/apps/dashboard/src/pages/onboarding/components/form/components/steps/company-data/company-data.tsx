import { getOrgOptions } from '@onefootprint/axios/dashboard';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import Header from '../header';
import Content, { type CompanyFormData } from './components/content';
import ErrorComponent from './components/error';
import Loading from './components/loading';

export type CompanyDataProps = {
  onBack: () => void;
  onComplete: (data: CompanyFormData) => void;
};

const CompanyData = ({ onBack, onComplete }: CompanyDataProps) => {
  const { t } = useTranslation('onboarding', { keyPrefix: 'company-data' });
  const orgQuery = useQuery(getOrgOptions());

  return (
    <>
      <Header title={t('title')} subtitle={t('subtitle')} />
      {orgQuery.isPending && <Loading />}
      {orgQuery.data && <Content onBack={onBack} onComplete={onComplete} organization={orgQuery.data} />}
      {orgQuery.error && <ErrorComponent error={orgQuery.error} />}
    </>
  );
};

export default CompanyData;
