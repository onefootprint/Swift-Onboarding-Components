import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import useSession from 'src/hooks/use-session';
import Details from './pages/details';

const ListDetails = () => {
  const { t } = useTranslation('lists', { keyPrefix: 'details' });
  const _session = useSession();
  const {
    data: { user },
  } = useSession();
  const isFirmEmployee = user?.isFirmEmployee;

  return (
    <>
      <Head>
        <title>{t('html-title')}</title>
      </Head>
      {isFirmEmployee && <Details />}
    </>
  );
};
export default ListDetails;
