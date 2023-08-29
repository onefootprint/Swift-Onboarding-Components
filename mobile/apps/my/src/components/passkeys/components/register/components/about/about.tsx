import { Box, Dialog, LinkButton, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';

import useTranslation from '@/hooks/use-translation';

type AboutProps = {
  ctaDisabled: boolean;
};

const About = ({ ctaDisabled }: AboutProps) => {
  const { t } = useTranslation('components.passkeys.register');
  const [open, setOpen] = useState(false);

  return (
    <Box>
      <LinkButton disabled={ctaDisabled} onPress={() => setOpen(true)}>
        {t('about.cta')}
      </LinkButton>
      <Dialog
        onClose={() => setOpen(false)}
        open={open}
        title={t('about.title')}
        cta={{
          label: t('about.close'),
          onPress: () => setOpen(false),
        }}
      >
        <Typography variant="body-3" center>
          {t('about.content')}
        </Typography>
      </Dialog>
    </Box>
  );
};

export default About;
