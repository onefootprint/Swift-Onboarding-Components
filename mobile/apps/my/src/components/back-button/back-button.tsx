import { IcoChevronLeftBig24 } from '@onefootprint/icons';
import { IconButton } from '@onefootprint/ui';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

export type BackButtonProps = {
  onPress?: () => void;
};

const BackButton = ({ onPress }: BackButtonProps) => {
  const { t } = useTranslation('components.back-button');

  return (
    <IconButton onPress={onPress} aria-label={t('cta')}>
      <IcoChevronLeftBig24 />
    </IconButton>
  );
};

export default BackButton;
