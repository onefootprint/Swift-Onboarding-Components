import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Banner } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React from 'react';
import useSession from 'src/hooks/use-session';

const AssumeBanner = () => {
  const { t } = useTranslation('components.private-layout.assume-banner');
  const { data } = useSession();
  const router = useRouter();

  const handleLogout = () => {
    router.push({
      pathname: '/organizations',
      query: { token: data.auth },
    });
  };

  return data.user?.isAssumedSession ? (
    <AssumeBannerContainer>
      <Banner variant="info">
        {t('title', { orgName: data.org?.name })}
        <button type="button" onClick={handleLogout}>
          {t('log-out')}
        </button>
      </Banner>
    </AssumeBannerContainer>
  ) : null;
};

const AssumeBannerContainer = styled.div`
  ${({ theme }) => css`
    border-bottom: 1px solid ${theme.borderColor.tertiary};
    width: 100%;

    button {
      padding: 0;
      margin-left: ${theme.spacing[2]};

      &:disabled {
        cursor: default;
        opacity: 0.7;
      }
    }
  `};
`;

export default AssumeBanner;
