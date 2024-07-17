import { IcoDollar40, IcoUser40 } from '@onefootprint/icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import GenericTransition from '../../../../components/animations/generic-transition';

type AnimationProps = { onAnimationEnd: () => void };

const Animation = ({ onAnimationEnd }: AnimationProps) => {
  const { t } = useTranslation('idv');

  return (
    <AnimationContainer>
      <GenericTransition
        firstMessage={{
          icon: IcoUser40,
          text: t('investor-profile.components.transition-animation.source'),
        }}
        secondMessage={{
          icon: IcoDollar40,
          text: t('investor-profile.components.transition-animation.destination'),
        }}
        onAnimationEnd={onAnimationEnd}
      />
    </AnimationContainer>
  );
};

const AnimationContainer = styled.div`
  display: flex;
  flex-grow: 1;
  justify-content: center;
  align-items: center;
  min-height: 180px;
`;

export default Animation;
