import { Box, Checkbox, Dialog, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';

import useTranslation from '@/hooks/use-translation';

import useConsent from './hooks/use-consent';

export type ConsentDialogProps = {
  authToken: string;
  onSubmit: () => void;
};

const ConsentDialog = ({ authToken, onSubmit }: ConsentDialogProps) => {
  const { t } = useTranslation('components.scan.selfie.consent');
  const consentMutation = useConsent();
  const [open, setOpen] = useState(true);
  const [isThirdPartyConsented, setIsThirdPartyConsented] = useState(false);

  const handleThirdParty = () => {
    setIsThirdPartyConsented(previousValue => !previousValue);
  };

  const handleSubmit = () => {
    const consentLanguages = isThirdPartyConsented
      ? [t('title'), t('description'), t('consent'), t('cta')]
      : [t('title'), t('description'), t('cta')];

    consentMutation.mutate(
      { consentLanguageText: consentLanguages.join(' '), authToken },
      {
        onSuccess: () => {
          setOpen(false);
          onSubmit();
        },
      },
    );
  };

  return (
    <Dialog
      disableClose
      open={open}
      title={t('title')}
      cta={{
        label: t('cta'),
        loading: consentMutation.isLoading,
        onPress: handleSubmit,
      }}
    >
      <Typography variant="body-3" center marginBottom={4}>
        {t('description')}
      </Typography>
      <Box
        backgroundColor="secondary"
        borderRadius="default"
        flexDirection="row"
        padding={5}
      >
        <Checkbox
          label={t('third-party')}
          onValueChange={handleThirdParty}
          value={isThirdPartyConsented}
        />
      </Box>
    </Dialog>
  );
};

export default ConsentDialog;
