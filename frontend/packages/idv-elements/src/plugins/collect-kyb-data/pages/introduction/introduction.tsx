import { useTranslation } from '@onefootprint/hooks';
import { IcoStore24, IcoUser24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Button } from '@onefootprint/ui';
import React from 'react';

import InfoBox from '../../../../components/info-box';
import HeaderTitle from '../../../../components/layout/components/header-title';
import CollectKybDataNavigationHeader from '../../components/collect-kyb-data-navigation-header';
import useCollectKybDataMachine from '../../hooks/use-collect-kyb-data-machine';

const Introduction = () => {
  const [, send] = useCollectKybDataMachine();
  const { allT, t } = useTranslation('kyb.pages.introduction');

  const handleClick = () => {
    send({
      type: 'introductionCompleted',
    });
  };

  return (
    <Container>
      <CollectKybDataNavigationHeader />
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
        variant="default"
      />
      <Button fullWidth onClick={handleClick}>
        {allT('kyb.pages.cta.continue')}
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
