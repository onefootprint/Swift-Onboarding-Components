import type { RiskSignal } from '@onefootprint/types';
import { Text } from '@onefootprint/ui';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

export type CountProps = {
  high?: RiskSignal[];
  medium?: RiskSignal[];
  low?: RiskSignal[];
};

const Count = ({ high = [], medium = [], low = [] }: CountProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.entity.risks' });
  const hasHighRisks = high.length > 0;
  const hasMediumRisks = medium.length > 0;
  const hasLowRisks = low.length > 0;
  const hasOnlyLowRisks = hasLowRisks && !hasMediumRisks && !hasHighRisks;
  const hasOnlyMediumRisks = hasMediumRisks && !hasHighRisks && !hasLowRisks;
  const hasOnlyHighRisks = hasHighRisks && !hasMediumRisks && !hasLowRisks;

  if (hasOnlyLowRisks) {
    return (
      <Text variant="label-3">
        <Trans components={{ a: <Intensity data-level="low" /> }} count={low.length} i18nKey="pages.entity.risks.low" />
      </Text>
    );
  }

  if (hasOnlyMediumRisks) {
    return (
      <Text variant="label-3">
        <Trans
          components={{ a: <Intensity data-level="medium" /> }}
          count={medium.length}
          i18nKey="pages.entity.risks.medium"
        />
      </Text>
    );
  }

  if (hasOnlyHighRisks) {
    return (
      <Text variant="label-3">
        <Trans
          components={{ a: <Intensity data-level="high" /> }}
          count={high.length}
          i18nKey="pages.entity.risks.high"
        />
      </Text>
    );
  }

  if (hasLowRisks && hasMediumRisks && hasHighRisks) {
    return (
      <Text variant="label-3">
        <Trans
          components={{
            a: <Intensity data-level="high" />,
            b: <Intensity data-level="medium" />,
            c: <Intensity data-level="low" />,
          }}
          count={high.length}
          i18nKey="pages.entity.risks.low-medium-high"
          values={{
            lowCount: low.length,
            mediumCount: medium.length,
            highCount: high.length,
          }}
        />
      </Text>
    );
  }

  if (hasLowRisks && hasMediumRisks) {
    return (
      <Text variant="label-3">
        <Trans
          components={{
            a: <Intensity data-level="medium" />,
            b: <Intensity data-level="low" />,
          }}
          count={high.length}
          i18nKey="pages.entity.risks.low-medium"
          values={{ lowCount: low.length, mediumCount: medium.length }}
        />
      </Text>
    );
  }

  if (hasLowRisks && hasHighRisks) {
    return (
      <Text variant="label-3">
        <Trans
          components={{
            a: <Intensity data-level="medium" />,
            b: <Intensity data-level="low" />,
          }}
          count={high.length}
          i18nKey="pages.entity.risks.low-high"
          values={{ lowCount: low.length, highCount: high.length }}
        />
      </Text>
    );
  }

  if (hasMediumRisks && hasHighRisks) {
    return (
      <Text variant="label-3">
        <Trans
          components={{
            a: <Intensity data-level="high" />,
            b: <Intensity data-level="medium" />,
          }}
          count={high.length}
          i18nKey="pages.entity.risks.medium-high"
          values={{ mediumCount: medium.length, highCount: high.length }}
        />
      </Text>
    );
  }

  return <Text variant="label-3">{t('empty-state')}</Text>;
};

const Intensity = styled.strong`
  ${({ theme }) => css`
    &[data-level='low'] {
      color: ${theme.color.info};
    }
    &[data-level='medium'] {
      color: ${theme.color.warning};
    }
    &[data-level='high'] {
      color: ${theme.color.error};
    }
  `};
`;

export default Count;
