import type { Icon } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Container } from '@onefootprint/ui';
import React from 'react';
import SectionIcon from 'src/components/section-icon';

type TimelineLayoutProps = {
  icon: Icon;
  children: React.ReactNode;
};

const TimelineLayout = ({ icon, children }: TimelineLayoutProps) => (
  <StyledContainer>
    <Line>
      <SectionIcon icon={icon} />
    </Line>
    <Content>{children}</Content>
  </StyledContainer>
);

const StyledContainer = styled(Container)`
  ${({ theme }) => css`
    display: grid;
    grid-template-columns: ${theme.spacing[9]} 1fr;
    grid-column-gap: ${theme.spacing[7]};
    padding-bottom: ${theme.spacing[7]};
    grid-template-areas: 'line content';
  `}
`;

const Line = styled.div`
  ${({ theme }) => css`
    grid-area: line;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      z-index: 0;
      top: 0;
      left: 50%;
      width: 1px;
      height: 100%;
      background: radial-gradient(
        100% 100% at 50% 50%,
        ${theme.borderColor.primary} 0%,
        transparent 50%
      );
    }
  `}
`;

const Content = styled.div`
  grid-area: content;
  padding-top: 6px;
`;

export default TimelineLayout;
