import { HeaderTitle } from '@onefootprint/idv';
import { Button } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useHostedMachine from 'src/hooks/use-hosted-machine';
import styled, { css } from 'styled-components';

const Expired = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.expired' });
  const [, send] = useHostedMachine();

  const handleClick = () => {
    send({ type: 'reset' });
  };

  return (
    <Container>
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
      <Button fullWidth onClick={handleClick}>
        {t('cta')}
      </Button>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[7]};
    justify-content: center;
    align-items: center;
    padding-top: ${theme.spacing[8]};
  `}
`;

export default Expired;
