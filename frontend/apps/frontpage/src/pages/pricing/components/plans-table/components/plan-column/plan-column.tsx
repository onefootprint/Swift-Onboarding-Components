import { useTranslation } from '@onefootprint/hooks';
import type { ButtonProps } from '@onefootprint/ui';
import { Button, Stack } from '@onefootprint/ui';
import React from 'react';

import type { Period, Plans } from '../../plans-table-types';
import FeatureCheck from './components/feature-check';
import Header from './components/header';

type PlanColumnProps = {
  title: Plans;
  price?: {
    monthly?: number;
    yearly?: number;
  };
  period: Period;
  features: string[];
  buttonVariant: ButtonProps['variant'];
  buttonLabel: string;
  onButtonClick: () => void;
};

const PlanColumn = ({
  price,
  title,
  period,
  features,
  buttonLabel,
  buttonVariant,
  onButtonClick,
}: PlanColumnProps) => {
  const { t } = useTranslation('pages.pricing');

  return (
    <Stack
      direction="column"
      paddingLeft={5}
      paddingRight={5}
      minWidth="410px"
      maxWidth="410px"
    >
      <Header title={t(`plans.${title}.title`)} price={price} period={period} />
      <Stack direction="column" flexGrow={1} gap={3} padding={5}>
        {features.map(feature => (
          <FeatureCheck key={feature}>
            {t(`plans.${title}.${feature}`)}
          </FeatureCheck>
        ))}
      </Stack>
      <Stack padding={5}>
        <Button
          variant={buttonVariant}
          onClick={onButtonClick}
          size="compact"
          fullWidth
        >
          {t(`plans.${title}.${buttonLabel}`)}
        </Button>
      </Stack>
    </Stack>
  );
};

export default PlanColumn;
