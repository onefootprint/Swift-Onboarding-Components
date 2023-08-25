import {
  IcoLayer24,
  IcoSmartphone24,
  IcoSparkles24,
  IcoSquareFrame24,
} from '@onefootprint/icons';
import { Box, Button, Container, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';

import BackButton from '@/components/back-button';
import Header from '@/components/header';
import useTranslation from '@/hooks/use-translation';

import { useScanContext } from '../scan-context';
import Stepper, { StepperProps } from '../stepper';

type DefaultInstructionsProps = {
  title: string;
  children: JSX.Element;
  stepperValues: StepperProps;
};

const DefaultInstructions = ({
  title,
  children,
  stepperValues,
}: DefaultInstructionsProps) => {
  const { t } = useTranslation('components.scan.instructions.document');
  const [show, setShow] = useState(false);
  const { onBack } = useScanContext();
  const { value, max } = stepperValues;
  const options = [
    {
      label: t('contrast'),
      Icon: IcoLayer24,
    },
    {
      label: t('in-view'),
      Icon: IcoSquareFrame24,
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
          <Header
            headerLeft={value === 0 ? <BackButton onPress={onBack} /> : null}
          >
            {max > 1 && (
              <Box>
                <Stepper value={value} max={max} />
              </Box>
            )}
          </Header>
          <Box center>
            <Typography variant="heading-3" marginVertical={7} center>
              {title}
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

export default DefaultInstructions;
