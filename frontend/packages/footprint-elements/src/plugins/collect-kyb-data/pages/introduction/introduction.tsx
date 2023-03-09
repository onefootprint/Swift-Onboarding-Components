import { useTranslation } from '@onefootprint/hooks';
import { IcoStore24, IcoUser24 } from '@onefootprint/icons';
import { Button } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import { HeaderTitle, InfoBox, NavigationHeader } from '../../../../components';
import useCollectKybDataMachine from '../../hooks/use-collect-kyb-data-machine';

const Introduction = () => {
  const [, send] = useCollectKybDataMachine();
  const { t } = useTranslation('pages.introduction');

  const handleClick = () => {
    send({
      type: 'introductionCompleted',
    });
  };

  return (
    <Container>
      <NavigationHeader button={{ variant: 'close' }} />
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
      <InfoBox
        items={[
          {
            title: t('guidelines.beneficial-owner.title'),
            description: t('guidelines.beneficial-owner.description'),
            Icon: IcoStore24,
          },
          {
            title: t('guidelines.bo-kyc.title'),
            description: t('guidelines.bo-kyc.description'),
            Icon: IcoUser24,
          },
        ]}
      />
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
  `}
`;

export default Introduction;
