import { IcoClose24, IcoLayer24, IcoSmartphone224, IcoSparkles24, IcoSquareFrame24 } from '@onefootprint/icons';
import { Box, Pressable, Typography } from '@onefootprint/ui';
import React from 'react';
import { Modal } from 'react-native';

import useTranslation from '@/hooks/use-translation';

const InstructionsModal = ({ visible, onClose }) => {
  const { t } = useTranslation('scan.instructions');
  const instructions = [
    {
      title: t('bg.title'),
      description: t('bg.description'),
      Icon: IcoLayer24,
    },
    {
      title: t('frame.title'),
      description: t('frame.description'),
      Icon: IcoSquareFrame24,
    },
    {
      title: t('hold.title'),
      description: t('hold.description'),
      Icon: IcoSmartphone224,
    },
    {
      title: t('auto.title'),
      description: t('auto.description'),
      Icon: IcoSparkles24,
    },
  ];

  return (
    <Modal visible={visible} onRequestClose={onClose} animationType="slide" presentationStyle="formSheet">
      <Box padding={5} alignItems="center" justifyContent="center" flexDirection="row" position="relative">
        <Box>
          <Typography variant="label-2">{t('title')}</Typography>
        </Box>
        <Box position="absolute" right={16}>
          <Pressable onPress={onClose}>
            <IcoClose24 />
          </Pressable>
        </Box>
      </Box>
      <Box gap={7} padding={5}>
        {instructions.map(({ title, description, Icon }) => (
          <Box gap={3} flexDirection="row" key={title}>
            <Box>
              <Icon />
            </Box>
            <Box gap={2} flexShrink={1}>
              <Typography variant="label-3">{title}</Typography>
              <Typography variant="body-3">{description}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Modal>
  );
};

export default InstructionsModal;
