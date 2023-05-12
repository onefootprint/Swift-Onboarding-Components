import { IcoSettings24 } from '@onefootprint/icons';
import { IconButton } from '@onefootprint/ui';
import { useNavigation } from '@react-navigation/native';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

export type SettingsButtonProps = {};

const SettingsButton = () => {
  const { t } = useTranslation('components.settings-button');
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate('Settings');
  };

  return (
    <IconButton onPress={handlePress} aria-label={t('cta')}>
      <IcoSettings24 />
    </IconButton>
  );
};

export default SettingsButton;
