import {
  IcoIdFront40,
  IcoLayer24,
  IcoSmartphone24,
  IcoSparkles24,
  IcoSquareFrame24,
} from '@onefootprint/icons';
import { Box, Button, Container, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';

import useTranslation from '@/hooks/use-translation';

import Stepper, { StepperProps } from '../stepper';

type DocInstructionsProps = {
  title: string;
  children?: React.ReactNode;
  stepperValues: StepperProps;
};

const DocInstructions = ({
  title,
  children,
  stepperValues,
}: DocInstructionsProps) => {
  const { t } = useTranslation('components.scan.instructions.document');
  const [show, setShow] = useState(false);
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

  const { value, max } = stepperValues;

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
            {max > 1 && (
              <Box paddingTop={5} paddingBottom={8}>
                <Stepper value={value} max={max} />
              </Box>
            )}
            <IcoIdFront40 />
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
        <Button onPress={handleContinue}>{t('cta')}</Button>
      </Box>
    </Container>
  );
};

export default DocInstructions;
