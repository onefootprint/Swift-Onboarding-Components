import { useTranslation } from 'hooks';
import React from 'react';
import styled, { css } from 'styled-components';
import { Button } from 'ui';

import HeaderTitle from '../../components/header-title';
import useOpener from '../../hooks/use-opener';

const Expired = () => {
  const { t } = useTranslation('pages.expired');
  const opener = useOpener();

  const handleClick = () => {
    window.close();
  };

  return (
    <Container>
      <HeaderTitle
        title={t('title')}
        subtitle={
          opener === 'mobile' ? t('subtitle.mobile') : t('subtitle.desktop')
        }
      />
      {opener === 'mobile' && (
        <Button onClick={handleClick} fullWidth>
          {t('cta')}
        </Button>
      )}
    </Container>
  );
};

const Container = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[8]}px;
  `}
`;

export default Expired;
