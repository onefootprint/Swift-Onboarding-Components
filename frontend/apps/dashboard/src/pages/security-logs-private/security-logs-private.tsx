import { SearchInput, Text } from '@onefootprint/ui';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import useSession from 'src/hooks/use-session';

const SecurityLogsPrivate = () => {
  const { t } = useTranslation('security-logs');
  const {
    data: { user },
  } = useSession();

  if (!user?.isFirmEmployee) {
    return <div>Private page</div>;
  }

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Text variant="heading-2" marginBottom={5}>
        {t('header.title')}
      </Text>
      <SearchInput
        width="232px"
        onChangeText={() => console.log('test change text')}
        value=""
        size="compact"
        placeholder={t('filters.search')}
      />
    </>
  );
};

export default SecurityLogsPrivate;
