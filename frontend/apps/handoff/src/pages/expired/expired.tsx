import { useTranslation } from '@onefootprint/hooks';
import { HeaderTitle, NavigationHeader } from '@onefootprint/idv-elements';
import { Button } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import useHandoffMachine from '../../hooks/use-handoff-machine/use-handoff-machine';

const Expired = () => {
  const { t } = useTranslation('pages.expired');
  const [state] = useHandoffMachine();
  const { opener } = state.context;

  const handleClick = () => {
    window.close();
  };

  return (
    <>
      <NavigationHeader />
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
    </>
  );
};

const Container = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[8]};
  `}
`;

export default Expired;
