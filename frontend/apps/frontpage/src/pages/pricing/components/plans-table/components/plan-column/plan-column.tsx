import type { ButtonProps } from '@onefootprint/ui';
import { Button, Stack } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';

import { Plans } from '../../plans-table-types';
import EverythingAndBanner from './components/everything-and-banner';
import FeatureCheck from './components/feature-check';
import Header from './components/header';

type FeatureProps = {
  translation: string;
  soon: boolean;
};

type PlanColumnProps = {
  title: Plans;
  price?: {
    monthly?: number;
    yearly?: number;
  };
  features: FeatureProps[];
  buttonVariant: ButtonProps['variant'];
  buttonLabel: string;
  onButtonClick: () => void;
};

const PlanColumn = ({ price, title, features, buttonLabel, buttonVariant, onButtonClick }: PlanColumnProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.pricing' });

  return (
    <Stack direction="column" paddingLeft={5} paddingRight={5} minWidth="410px" maxWidth="410px">
      <Header title={t(`plans.${title}.title` as ParseKeys<'common'>)} price={price} />
      <Stack direction="column" flexGrow={1} gap={3} padding={5}>
        {title !== Plans.startup && <EverythingAndBanner plan={title} />}
        {features.map(feature => (
          <FeatureCheck key={feature.translation} soon={feature.soon}>
            {t(`plans.${title}.${feature.translation}` as ParseKeys<'common'>)}
          </FeatureCheck>
        ))}
      </Stack>
      <Stack padding={5}>
        <Button variant={buttonVariant} onClick={onButtonClick} fullWidth size="large">
          {t(`plans.${title}.${buttonLabel}` as ParseKeys<'common'>)}
        </Button>
      </Stack>
    </Stack>
  );
};

export default PlanColumn;
