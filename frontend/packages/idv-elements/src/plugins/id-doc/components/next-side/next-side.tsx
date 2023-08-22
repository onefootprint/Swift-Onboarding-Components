import { useTranslation } from '@onefootprint/hooks';
import { IdDocImageTypes, SupportedIdDocTypes } from '@onefootprint/types';
import { Box, Typography } from '@onefootprint/ui';
import React from 'react';
import { useTimeout } from 'usehooks-ts';

import { imageIcons } from '../../constants/image-types';
import { TRANSITION_DELAY_DEFAULT } from '../../constants/transition-delay.constants';

type NextSideProps = {
  docType: SupportedIdDocTypes;
  nextSideImageType: IdDocImageTypes;
  onComplete: () => void;
};

const NextSide = ({
  docType,
  nextSideImageType,
  onComplete,
}: NextSideProps) => {
  const { t } = useTranslation('components.next-side');
  const Icon = imageIcons[nextSideImageType];

  useTimeout(() => {
    onComplete();
  }, TRANSITION_DELAY_DEFAULT);

  const side =
    docType === SupportedIdDocTypes.passport &&
    nextSideImageType === IdDocImageTypes.front
      ? 'one-side'
      : nextSideImageType;

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      <Icon />
      <Typography variant="label-1" sx={{ marginTop: 5, textAlign: 'center' }}>
        {t(side)}
      </Typography>
    </Box>
  );
};

export default NextSide;
