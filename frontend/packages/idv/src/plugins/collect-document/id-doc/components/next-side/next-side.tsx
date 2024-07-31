import type { IdDocImageTypes } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTimeout } from 'usehooks-ts';

import { ImageIcons, TRANSITION_DELAY_DEFAULT } from '../../../constants';

type NextSideProps = {
  nextSideImageType: IdDocImageTypes;
  onComplete: () => void;
};

const NextSide = ({ nextSideImageType, onComplete }: NextSideProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'document-flow.id-doc.components.next-side',
  });
  const Icon = ImageIcons[nextSideImageType];

  useTimeout(() => {
    onComplete();
  }, TRANSITION_DELAY_DEFAULT);

  return (
    <Stack direction="column" align="center">
      <Icon />
      <Text variant="label-1" textAlign="center" marginTop={5}>
        {t(nextSideImageType)}
      </Text>
    </Stack>
  );
};

export default NextSide;
