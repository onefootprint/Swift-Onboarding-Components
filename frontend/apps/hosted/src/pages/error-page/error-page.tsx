import { useRequestErrorToast } from '@onefootprint/hooks';
import { HeaderTitle } from '@onefootprint/idv';
import { useRequestError } from '@onefootprint/request';
import { Box, Stack } from '@onefootprint/ui';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useHostedMachine } from 'src/components/hosted-machine-provider';

const ErrorPage = () => {
  const { getErrorCode } = useRequestError();
  const [state] = useHostedMachine();
  const { error } = state.context;

  const isExpiredError = getErrorCode(error) === 'E118';
  if (isExpiredError) {
    return <LinkExpiredError />;
  }

  return <GenericError error={error} />;
};

const LinkExpiredError = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.error-page' });

  return (
    <Stack flexDirection="column" justifyContent="center" alignItems="center" rowGap={7} paddingTop={8}>
      <HeaderTitle title={t('expired.title')} subtitle={t('expired.subtitle')} />
    </Stack>
  );
};

const GenericError = ({ error }: { error: unknown }) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.error-page' });
  const showRequestError = useRequestErrorToast();

  useEffect(() => {
    showRequestError(error);
  }, []);

  return (
    <Box paddingTop={8}>
      <HeaderTitle title={t('generic.title')} subtitle={t('generic.subtitle')} />
    </Box>
  );
};

export default ErrorPage;
