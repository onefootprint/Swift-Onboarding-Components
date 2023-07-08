import {
  IcoEmojiHappy24,
  IcoSelfie40,
  IcoSmartphone24,
  IcoSparkles24,
} from '@onefootprint/icons';
import { Box, Button, Container, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';

import useTranslation from '@/hooks/use-translation';

type InstructionsProps = {
  children?: React.ReactNode;
};

const Instructions = ({ children }: InstructionsProps) => {
  const { t } = useTranslation('components.scan.instructions.selfie');
  const [show, setShow] = useState(false);
  const options = [
    {
      label: t('frame'),
      Icon: IcoEmojiHappy24,
    },
    {
      label: t('steady'),
      Icon: IcoSmartphone24,
    },
    {
      label: t('auto-capture'),
      Icon: IcoSparkles24,
    },
  ];

  const handleContinue = () => {
    setShow(true);
  };

  return show ? (
    <Box>{children}</Box>
  ) : (
    <Container>
      <Box flex={1} justifyContent="space-between">
        <Box>
          <Box center>
            <IcoSelfie40 />
            <Typography variant="heading-3" marginVertical={7} center>
              {t('title')}
            </Typography>
            <Typography
              center
              color="secondary"
              marginBottom={9}
              variant="body-2"
            >
              {t('subtitle')}
            </Typography>
          </Box>
          <Box
            backgroundColor="secondary"
            padding={5}
            gap={7}
            borderRadius="default"
          >
            {options.map(({ Icon, label }) => (
              <Box gap={3} key={label} flexDirection="row" align-items="center">
                <Icon />
                <Typography variant="label-3">{label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
        <Button onPress={handleContinue}>{t('cta')}</Button>
      </Box>
    </Container>
  );
};

export default Instructions;
