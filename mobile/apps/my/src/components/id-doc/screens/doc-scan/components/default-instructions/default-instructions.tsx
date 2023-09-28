import {
  IcoLayer24,
  IcoSmartphone24,
  IcoSparkles24,
  IcoSquareFrame24,
} from '@onefootprint/icons';
import { UploadDocumentSide } from '@onefootprint/types';
import { Box, Button, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';

import BackButton from '@/components/back-button';
import Header from '@/components/header';
import ScrollLayout from '@/components/scroll-layout';
import useTranslation from '@/hooks/use-translation';

import { useScanContext } from '../scan-context';

type DefaultInstructionsProps = {
  children: JSX.Element;
  side: UploadDocumentSide;
  title: string;
};

const DefaultInstructions = ({
  children,
  side,
  title,
}: DefaultInstructionsProps) => {
  const { t } = useTranslation('components.scan.instructions.document');
  const [show, setShow] = useState(false);
  const { onBack } = useScanContext();
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
    <ScrollLayout Footer={<Button onPress={handleContinue}>{t('cta')}</Button>}>
      <Box flex={1} justifyContent="space-between">
        <Box>
          <Header
            headerLeft={
              side === UploadDocumentSide.Front ? (
                <BackButton onPress={onBack} />
              ) : null
            }
          />
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
    </ScrollLayout>
  );
};

export default DefaultInstructions;
