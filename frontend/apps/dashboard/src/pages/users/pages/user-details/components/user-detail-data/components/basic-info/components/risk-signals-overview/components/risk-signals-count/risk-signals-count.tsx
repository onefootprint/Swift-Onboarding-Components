import { useTranslation } from '@onefootprint/hooks';
import { RiskSignal } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import { Trans } from 'react-i18next';
import styled, { css } from 'styled-components';

export type RiskSignalsCountProps = {
  high?: RiskSignal[];
  medium?: RiskSignal[];
  low?: RiskSignal[];
};

const RiskSignalsCount = ({
  high = [],
  medium = [],
  low = [],
}: RiskSignalsCountProps) => {
  const { t } = useTranslation('pages.user-details.user-info.risks');
  const hasHighRisks = high.length > 0;
  const hasMediumRisks = medium.length > 0;
  const hasLowRisks = low.length > 0;
  const hasOnlyLowRisks = hasLowRisks && !hasMediumRisks && !hasHighRisks;
  const hasOnlyMediumRisks = hasMediumRisks && !hasHighRisks && !hasLowRisks;
  const hasOnlyHighRisks = hasHighRisks && !hasMediumRisks && !hasLowRisks;

  if (hasOnlyLowRisks) {
    return (
      <Typography variant="label-3">
        <Trans
          components={{ a: <Intensity data-level="low" /> }}
          count={low.length}
          i18nKey="pages.user-details.user-info.risks.low"
        />
      </Typography>
    );
  }

  if (hasOnlyMediumRisks) {
    return (
      <Typography variant="label-3">
        <Trans
          components={{ a: <Intensity data-level="medium" /> }}
          count={medium.length}
          i18nKey="pages.user-details.user-info.risks.medium"
        />
      </Typography>
    );
  }

  if (hasOnlyHighRisks) {
    return (
      <Typography variant="label-3">
        <Trans
          components={{ a: <Intensity data-level="high" /> }}
          count={high.length}
          i18nKey="pages.user-details.user-info.risks.high"
        />
      </Typography>
    );
  }

  if (hasLowRisks && hasMediumRisks && hasHighRisks) {
    return (
      <Typography variant="label-3">
        <Trans
          components={{
            a: <Intensity data-level="high" />,
            b: <Intensity data-level="medium" />,
            c: <Intensity data-level="low" />,
          }}
          count={high.length}
          i18nKey="pages.user-details.user-info.risks.low-medium-high"
          values={{
            lowCount: low.length,
            mediumCount: medium.length,
            highCount: high.length,
          }}
        />
      </Typography>
    );
  }

  if (hasLowRisks && hasMediumRisks) {
    return (
      <Typography variant="label-3">
        <Trans
          components={{
            a: <Intensity data-level="medium" />,
            b: <Intensity data-level="low" />,
          }}
          count={high.length}
          i18nKey="pages.user-details.user-info.risks.low-medium"
          values={{ lowCount: low.length, mediumCount: medium.length }}
        />
      </Typography>
    );
  }

  if (hasLowRisks && hasHighRisks) {
    return (
      <Typography variant="label-3">
        <Trans
          components={{
            a: <Intensity data-level="medium" />,
            b: <Intensity data-level="low" />,
          }}
          count={high.length}
          i18nKey="pages.user-details.user-info.risks.low-high"
          values={{ lowCount: low.length, highCount: high.length }}
        />
      </Typography>
    );
  }

  if (hasMediumRisks && hasHighRisks) {
    return (
      <Typography variant="label-3">
        <Trans
          components={{
            a: <Intensity data-level="high" />,
            b: <Intensity data-level="medium" />,
          }}
          count={high.length}
          i18nKey="pages.user-details.user-info.risks.medium-high"
          values={{ mediumCount: medium.length, highCount: high.length }}
        />
      </Typography>
    );
  }

  return <Typography variant="label-3">{t('empty-state')}</Typography>;
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

export default RiskSignalsCount;
