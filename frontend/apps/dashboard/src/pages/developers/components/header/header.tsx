import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import React from 'react';

const Header = () => {
  const { t } = useTranslation('pages.developers');

  return (
    <HeaderContainer>
      <Typography variant="heading-3" as="h2" sx={{ marginBottom: 2 }}>
        {t('header.title')}
      </Typography>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.header`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    justify-content: space-between;
    margin-bottom: ${theme.spacing[5]};
  `};
`;

export default Header;
