import { Stack, Text, ThemeToggle } from '@onefootprint/ui';
import { useTheme } from 'next-themes';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import usePermissions from 'src/hooks/use-permissions';
import styled, { css } from 'styled-components';

import useSession from 'src/hooks/use-session';
import Billing from './components/billing';
import BusinessProfile from './components/business-profile';
import TeamRoles from './components/team-roles';

const Settings = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.settings' });
  const { theme, setTheme } = useTheme();
  const {
    data: { user, org },
  } = useSession();
  const { isAdmin } = usePermissions();

  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  const shouldShowBilling = (org?.id === 'org_AiK8peOw9mrqsb6yeHWEG8' && isAdmin) || user?.isFirmEmployee;

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Header>
        <Text variant="heading-2" tag="h2">
          {t('header.title')}
        </Text>
        <ThemeToggle label={t('header.theme')} onChange={handleToggleTheme} checked={theme === 'dark'} />
      </Header>
      <Stack gap={10} direction="column">
        <BusinessProfile />
        <TeamRoles />
        {shouldShowBilling ? <Billing /> : null}
      </Stack>
    </>
  );
};

const Header = styled.header`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    justify-content: space-between;
    margin-bottom: ${theme.spacing[7]};
  `};
`;

export default Settings;
