import { useTranslation } from '@onefootprint/hooks';
import { AccessLog } from '@onefootprint/types';
import { Box, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type AccessLogBodyProps = {
  accessLog: AccessLog;
};

const AccessLogBody = ({ accessLog }: AccessLogBodyProps) => {
  const { t } = useTranslation(
    'pages.my-footprint-identity.access-logs.timeline.log',
  );
  const timestamp = new Date(accessLog.timestamp);
  // TODO: Use "use-intl"
  // https://linear.app/footprint/issue/FP-595/use-use-intl-in-my1fp-access-logs-dates
  const dateString = timestamp.toLocaleString('en-us', {
    month: 'numeric',
    day: 'numeric',
    year: '2-digit',
    hour: 'numeric',
    minute: 'numeric',
  });

  // TODO: add truncation to reason
  // linear.app/footprint/issue/FP-588/add-show-more-to-access-log-reason
  return (
    <Container>
      <Box>
        <Typography variant="label-3">{t('when')}</Typography>
        <Typography variant="body-3">{dateString}</Typography>
      </Box>
      <Box>
        <Typography variant="label-3">{t('reason')}</Typography>
        <Typography variant="body-3">{accessLog.reason || '-'}</Typography>
      </Box>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]}px;
  `}
`;

export default AccessLogBody;
