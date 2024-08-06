import { Grid, LinkButton, Stack, Text } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import HelpDialog from './components/help-dialog';
import Id from './components/id';
import Logo from './components/logo';
import Name from './components/name';
import Parent from './components/parent/parent';
import SupportEmail from './components/support-email';
import SupportPhone from './components/support-phone';
import SupportWebsite from './components/support-website';
import Website from './components/website';
import type { ContentProps } from './content.types';

const Content = ({ organization }: ContentProps) => {
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.settings.business-profile.support-links',
  });
  const handleHelpDialogClose = () => {
    setHelpDialogOpen(false);
  };
  const handleHelpDialogOpen = () => {
    setHelpDialogOpen(true);
  };

  return (
    <Stack direction="column" gap={8}>
      <Logo organization={organization} />
      <Grid.Container columns={['repeat(4 , 1fr)']}>
        <Name value={organization.name} />
        <Website value={organization.websiteUrl} />
        <Id value={organization.id} />
      </Grid.Container>
      {organization.parent && <Parent org={organization.parent} />}
      <Stack direction="column" gap={5}>
        <Stack direction="column" gap={2}>
          <Text variant="label-2">{t('title')}</Text>
          <Stack direction="row" inline gap={2} align="center">
            <Text variant="body-3">{t('subtitle')}</Text>
            <LinkButton onClick={handleHelpDialogOpen}>{t('more-details')}</LinkButton>
            <HelpDialog open={helpDialogOpen} onClose={handleHelpDialogClose} />
          </Stack>
        </Stack>
        <Grid.Container columns={['repeat(4 , 1fr)']}>
          <SupportEmail value={organization.supportEmail} />
          <SupportPhone value={organization.supportPhone} />
          <SupportWebsite value={organization.supportWebsite} />
        </Grid.Container>
      </Stack>
    </Stack>
  );
};

export default Content;
