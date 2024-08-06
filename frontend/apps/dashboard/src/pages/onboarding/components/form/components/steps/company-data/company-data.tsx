import { useTranslation } from 'react-i18next';
import useOrg from 'src/hooks/use-org';

import Header from '../header';
import Content from './components/content';
import ErrorComponent from './components/error';
import Loading from './components/loading';

export type CompanyDataProps = {
  onBack: () => void;
  onComplete: () => void;
};

const CompanyData = ({ onBack, onComplete }: CompanyDataProps) => {
  const orgQuery = useOrg();
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.onboarding.company-data',
  });

  return (
    <>
      <Header title={t('title')} subtitle={t('subtitle')} />
      {orgQuery.isLoading && <Loading />}
      {orgQuery.data && <Content onBack={onBack} onComplete={onComplete} organization={orgQuery.data} />}
      {orgQuery.error && <ErrorComponent error={orgQuery.error} />}
    </>
  );
};

export default CompanyData;
