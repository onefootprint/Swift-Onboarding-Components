import { useTranslation } from '@onefootprint/hooks';
import { Box, Typography } from '@onefootprint/ui';
import React from 'react';
import { useTimeout } from 'usehooks-ts';

import { imageIcons, ImageTypes } from '../../constants/image-icons';
import TRANSITION_DELAY from '../../constants/transition-delay.constants';

type NextSideProps = {
  nextSideImageType: ImageTypes;
  onComplete: () => void;
};

const NextSide = ({ nextSideImageType, onComplete }: NextSideProps) => {
  const { t } = useTranslation('components.next-side');
  const Icon = imageIcons[nextSideImageType];

  useTimeout(() => {
    onComplete();
  }, TRANSITION_DELAY);

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      <Icon />
      <Typography variant="label-1" sx={{ marginTop: 5, textAlign: 'center' }}>
        {t(nextSideImageType)}
      </Typography>
    </Box>
  );
};

export default NextSide;
