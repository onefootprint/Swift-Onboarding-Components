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
        firstIcon={IcoUser40}
        secondIcon={IcoDollar40}
        firstText={t('investor-profile.components.transition-animation.source')}
        secondText={t('investor-profile.components.transition-animation.destination')}
        timeout={4000}
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
`;

export default Animation;
