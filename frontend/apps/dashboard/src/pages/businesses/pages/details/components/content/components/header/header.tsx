import { useIntl, useTranslation } from '@onefootprint/hooks';
import { CodeInline, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import { HEADER_ACTIONS_ID } from '@/business/constants';
import useEntity from '@/business/hooks/use-entity';
import StatusBadge from '@/businesses/components/status-badge';

const Header = () => {
  const { t } = useTranslation('pages.business.header');
  const { formatDateWithTime } = useIntl();
  const { data } = useEntity();

  return (
    <HeaderContainer aria-label={t('title')}>
      <Row>
        <Typography variant="label-1">{t('title')}</Typography>
        <StatusBadge
          status={data.status}
          requiresManualReview={data.requiresManualReview}
        />
      </Row>
      <SubHeader>
        <Row>
          <Typography variant="body-3" color="primary">
            {formatDateWithTime(new Date(data.startTimestamp))}
          </Typography>
          <Typography variant="body-3" color="tertiary" as="span">
            ·
          </Typography>
          <CodeInline isPrivate>{data.id}</CodeInline>
        </Row>
        <Row id={HEADER_ACTIONS_ID} />
      </SubHeader>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.header`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[2]};
  `};
`;

const Row = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: ${theme.spacing[3]};
  `};
`;

const SubHeader = styled.div`
  display: flex;
  flex-direction: column wrap;
  justify-content: space-between;
`;

export default Header;
