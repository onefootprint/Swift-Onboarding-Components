import { Box, useToast } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useOrgSession from 'src/hooks/use-org-session';
import { useEffectOnce } from 'usehooks-ts';

export type ModeSwitcherProps = {
  children: React.ReactNode;
};

const ModeSwitcher = ({ children }: ModeSwitcherProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'components.private-layout.mode-switcher',
  });
  const { sandbox } = useOrgSession();
  const toast = useToast();

  useEffectOnce(() => {
    const toggleMode = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const mode = urlParams.get('mode');
      const isSameMode = (mode === 'sandbox' && sandbox.isSandbox) || (mode === 'live' && !sandbox.isSandbox);
      if (!mode || isSameMode || !sandbox.canToggle) return;

      await sandbox.toggle();
      if (mode === 'sandbox') {
        toast.show({
          title: t('live-to-sandbox.title'),
          description: t('live-to-sandbox.description'),
        });
      } else {
        toast.show({
          title: t('sandbox-to-live.title'),
          description: t('sandbox-to-live.description'),
        });
      }
    };
    toggleMode();
  });

  return <Box>{children}</Box>;
};

export default ModeSwitcher;
