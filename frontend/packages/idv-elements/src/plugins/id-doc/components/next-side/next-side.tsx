import { useTranslation } from '@onefootprint/hooks';
import type { IdDocImageTypes } from '@onefootprint/types';
import { Stack, Typography } from '@onefootprint/ui';
import React from 'react';
import { useTimeout } from 'usehooks-ts';

import { imageIcons } from '../../constants/image-types';
import { TRANSITION_DELAY_DEFAULT } from '../../constants/transition-delay.constants';

type NextSideProps = {
  nextSideImageType: IdDocImageTypes;
  onComplete: () => void;
};

const NextSide = ({ nextSideImageType, onComplete }: NextSideProps) => {
  const { t } = useTranslation('components.next-side');
  const Icon = imageIcons[nextSideImageType];

  useTimeout(() => {
    onComplete();
  }, TRANSITION_DELAY_DEFAULT);

  return (
    <Stack direction="column" align="center">
      <Icon />
      <Typography variant="label-1" sx={{ marginTop: 5, textAlign: 'center' }}>
        {t(nextSideImageType)}
      </Typography>
    </Stack>
  );
};

export default NextSide;
