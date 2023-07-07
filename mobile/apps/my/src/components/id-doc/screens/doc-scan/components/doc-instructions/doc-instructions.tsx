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

type DocInstructionsProps = {
  title: string;
  children?: React.ReactNode;
};

const DocInstructions = ({ title, children }: DocInstructionsProps) => {
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

  const handleContinue = () => {
    setShow(true);
  };

  return show ? (
    children
  ) : (
    <Container>
      <Box flex={1} justifyContent="space-between">
        <Box>
          <Box center>
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

export default DocInstructions;
