import {
  IcoEmojiHappy24,
  IcoSmartphone24,
  IcoSparkles24,
} from '@onefootprint/icons';
import { Box, Button, Container, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';

import BackButton from '@/components/back-button';
import Header from '@/components/header';
import useTranslation from '@/hooks/use-translation';

import { useScanContext } from '../../../scan-context';
import Stepper, { type StepperProps } from '../../../stepper';

type InstructionsProps = {
  children: JSX.Element;
  stepperValues: StepperProps;
};

const Instructions = ({ children, stepperValues }: InstructionsProps) => {
  const { t } = useTranslation('components.scan.instructions.selfie');
  const [show, setShow] = useState(false);
  const { onBack } = useScanContext();
  const { value, max } = stepperValues;
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

  const handleBack = () => {
    setShow(false);
  };

  const handleContinue = () => {
    setShow(true);
  };

  return show ? (
    <Box>
      {React.cloneElement(children, {
        onBack: handleBack,
      })}
    </Box>
  ) : (
    <Container>
      <Box flex={1} justifyContent="space-between">
        <Box>
          <Box center>
            <Header
              headerLeft={value === 0 ? <BackButton onPress={onBack} /> : null}
            >
              {max > 1 && (
                <Box>
                  <Stepper value={value} max={max} />
                </Box>
              )}
            </Header>
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
                <Box flexShrink={1}>
                  <Typography variant="label-3">{label}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
      <Box top={24}>
        <Button onPress={handleContinue}>{t('cta')}</Button>
      </Box>
    </Container>
  );
};

export default Instructions;
