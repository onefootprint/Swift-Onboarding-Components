import type { IdDocImageTypes } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTimeout } from 'usehooks-ts';

import { imageIcons } from '../../constants/image-types';
import { TRANSITION_DELAY_DEFAULT } from '../../constants/transition-delay.constants';

type NextSideProps = {
  nextSideImageType: IdDocImageTypes;
  onComplete: () => void;
};

const NextSide = ({ nextSideImageType, onComplete }: NextSideProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'id-doc.components.next-side',
  });
  const Icon = imageIcons[nextSideImageType];

  useTimeout(() => {
    onComplete();
  }, TRANSITION_DELAY_DEFAULT);

  return (
    <Stack direction="column" align="center">
      <Icon />
      <Text variant="label-1" sx={{ marginTop: 5, textAlign: 'center' }}>
        {t(nextSideImageType)}
      </Text>
    </Stack>
  );
};

export default NextSide;
