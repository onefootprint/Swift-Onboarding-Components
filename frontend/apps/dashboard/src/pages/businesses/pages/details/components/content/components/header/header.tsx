import { useIntl, useTranslation } from '@onefootprint/hooks';
import { CodeInline, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import { WithEntityProps } from '@/business/components/with-entity';
import { HEADER_ACTIONS_ID } from '@/business/constants';
import StatusBadge from '@/businesses/components/status-badge';

type HeaderProps = WithEntityProps;

const Header = ({ entity }: HeaderProps) => {
  const { t } = useTranslation('pages.business.header');
  const { formatDateWithTime } = useIntl();

  return (
    <HeaderContainer aria-label={t('title')}>
      <Row>
        <Typography variant="label-1">{t('title')}</Typography>
        <StatusBadge
          status={entity.status}
          requiresManualReview={entity.requiresManualReview}
        />
      </Row>
      <SubHeader>
        <Row>
          <Typography variant="body-3" color="primary">
            {formatDateWithTime(new Date(entity.startTimestamp))}
          </Typography>
          <Typography variant="body-3" color="tertiary" as="span">
            ·
          </Typography>
          <CodeInline isPrivate>{entity.id}</CodeInline>
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
