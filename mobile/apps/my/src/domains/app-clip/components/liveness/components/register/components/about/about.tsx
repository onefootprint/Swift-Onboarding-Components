import { Box, Button, Dialog } from '@onefootprint/ui';
import React, { useState } from 'react';

import useTranslation from '@/hooks/use-translation';

type AboutProps = {
  ctaDisabled: boolean;
};

const About = ({ ctaDisabled }: AboutProps) => {
  const { t } = useTranslation('components.liveness.register');
  const [open, setOpen] = useState(false);

  return (
    <Box>
      <Button
        disabled={ctaDisabled}
        onPress={() => setOpen(true)}
        variant="secondary"
      >
        {t('about.cta')}
      </Button>
      <Dialog
        onClose={() => setOpen(false)}
        open={open}
        title={t('about.title')}
      >
        {t('about.content')}
      </Dialog>
    </Box>
  );
};

export default About;
