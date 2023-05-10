import { IcoChevronLeftBig24 } from '@onefootprint/icons';
import { IconButton } from '@onefootprint/ui';
import { useNavigation } from '@react-navigation/native';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

export type BackButtonProps = {};

const BackButton = () => {
  const { t } = useTranslation('components.back-button');
  const navigation = useNavigation();

  return (
    <IconButton onPress={navigation.goBack} aria-label={t('cta')}>
      <IcoChevronLeftBig24 />
    </IconButton>
  );
};

export default BackButton;
