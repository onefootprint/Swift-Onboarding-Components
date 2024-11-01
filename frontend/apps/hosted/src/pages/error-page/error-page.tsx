import { useRequestErrorToast } from '@onefootprint/hooks';
import { IcoCheckCircle40 } from '@onefootprint/icons';
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
  const errorCode = getErrorCode(error);

  const isLinkAlreadyUsedError = errorCode === 'E125';
  if (isLinkAlreadyUsedError) {
    return <LinkAlreadyUsedError />;
  }

  const isExpiredError = errorCode === 'E118';
  if (isExpiredError) {
    return <LinkExpiredError />;
  }

  return <GenericError error={error} />;
};

const LinkAlreadyUsedError = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.error-page' });

  return (
    <Stack direction="column" alignItems="center" justifyContent="center" paddingTop={8}>
      <IcoCheckCircle40 color="success" />
      <Box marginBottom={4} />
      <HeaderTitle title={t('link-used.title')} subtitle={t('link-used.subtitle')} />
    </Stack>
  );
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
