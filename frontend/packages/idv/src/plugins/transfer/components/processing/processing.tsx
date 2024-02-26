import { AnimatedLoadingSpinner, LinkButton } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import HeaderTitle from '../../../../components/layout/components/header-title';
import NavigationHeader from '../../../../components/layout/components/navigation-header';

type ProcessingProps = {
  title: string;
  subtitle: string;
  cta: string;
  onCancel: () => void;
};

const Processing = ({ title, subtitle, cta, onCancel }: ProcessingProps) => (
  <>
    <NavigationHeader leftButton={{ variant: 'close', confirmClose: true }} />
    <Container>
      <HeaderTitle title={title} subtitle={subtitle} />
      <AnimatedLoadingSpinner animationStart />
      <LinkButton onClick={onCancel}>{cta}</LinkButton>
    </Container>
  </>
);

const Container = styled.form`
  ${({ theme }) => css`
    row-gap: ${theme.spacing[7]};
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  `}
`;

export default Processing;
