import { Container, Stack, Text, media } from '@onefootprint/ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import {
  ARPU_MAX,
  ARPU_MIN,
  ARPU_START,
  ARPU_STEP,
  ONBOARD_MAX,
  ONBOARD_MIN,
  ONBOARD_START,
  ONBOARD_STEP,
} from './benefit-calculator.constants';
import Slider from './components/slider';

const formatCurrency = (value: number, decimals: number = 2) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('en-US').format(value);
};

const calculateResult = (monthlyOnboards: number, arpuMo: number) => {
  return 12 * monthlyOnboards * (12 * arpuMo) * 0.0025;
};

const BenefitCalculator = () => {
  const [monthlyOnboards, setMonthlyOnboards] = useState(ONBOARD_START);
  const [arpuMo, setArpuMo] = useState(ARPU_START);
  const [result, setResult] = useState(0);
  const { t } = useTranslation('common', { keyPrefix: 'pages.pricing.calculator' });

  useEffect(() => {
    const calculatedResult = calculateResult(monthlyOnboards, arpuMo);
    setResult(calculatedResult);
  }, [monthlyOnboards, arpuMo]);

  const handleMonthlyOnboardsChange = (value: number[]) => {
    setMonthlyOnboards(value[0]);
  };

  const handleArpuMoChange = (value: number[]) => {
    setArpuMo(value[0]);
  };

  return (
    <StyledContainer gap={7} alignItems="center">
      <Stack direction="column" gap={4} alignItems="center" maxWidth="600px">
        <Text variant="display-3" tag="h2" textAlign="center">
          {t('title')}
        </Text>
        <Text variant="display-5" tag="p" color="secondary" textAlign="center">
          {t('subtitle')}
        </Text>
      </Stack>
      <SlidersContainer>
        <Stack direction="column" gap={3}>
          <Stack direction="row" justifyContent="space-between">
            <Text variant="label-1" tag="label" color="secondary">
              {t('monthly-onboards.label')}
            </Text>
            <Text variant="label-1" tag="label">
              {formatNumber(monthlyOnboards)}
            </Text>
          </Stack>
          <Slider
            min={ONBOARD_MIN}
            max={ONBOARD_MAX}
            step={ONBOARD_STEP}
            value={monthlyOnboards}
            onChange={handleMonthlyOnboardsChange}
          />
        </Stack>
        <Stack direction="column" gap={3}>
          <Stack direction="row" justifyContent="space-between">
            <Text variant="label-1" tag="label" color="secondary">
              {t('arpu.label')}
            </Text>
            <Text variant="label-1" tag="label">
              {formatCurrency(arpuMo, 2)}
            </Text>
          </Stack>
          <Slider min={ARPU_MIN} max={ARPU_MAX} step={ARPU_STEP} value={arpuMo} onChange={handleArpuMoChange} />
        </Stack>
        <Stack direction="column" gap={3}>
          <Stack direction="row" justifyContent="space-between" gap={5}>
            <Text variant="heading-2" tag="label" color="primary">
              {t('result.label')}
            </Text>
            <Text variant="heading-2" tag="label">
              {formatCurrency(result, 0)}
            </Text>
          </Stack>
          <Text variant="body-1" tag="label" color="tertiary" maxWidth="540px">
            {t('callout.label')}
          </Text>
        </Stack>
      </SlidersContainer>
    </StyledContainer>
  );
};

const StyledContainer = styled(Container)`
  ${({ theme }) => css`
    position: relative;
    padding: ${theme.spacing[11]} 0;

    &::before {
      content: '';
      position: absolute;
      width: 100%;
      height: ${theme.borderWidth[1]};
      top: 0;
      left: 0;
      background: linear-gradient(
        to right,
        transparent,
        ${theme.borderColor.tertiary} 50%,
        transparent
      );
    }
  `}
`;

const SlidersContainer = styled(Stack)`
${({ theme }) => css`
  width: 100%;
  flex-direction: column;
  gap: ${theme.spacing[9]};
  max-width: 800px;
  margin: 0 auto;
  padding: ${theme.spacing[7]} 0;

  ${media.greaterThan('md')`
    padding: ${theme.spacing[7]};
  `}
`}
`;

export default BenefitCalculator;
