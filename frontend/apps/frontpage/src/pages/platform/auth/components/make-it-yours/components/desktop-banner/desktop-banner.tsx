import { Container, Stack, media } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

import Heather from '../header';
import Screen from '../screen';

type DesktopBannerProps = {
  title: string;
  subtitle: string;
  className?: string;
};

const DesktopBanner = ({ title, subtitle, className }: DesktopBannerProps) => (
  <StyledContainer className={className}>
    <Banner direction="column" gap={8} align="center">
      <Heather title={title} subtitle={subtitle} />
      <Shifter>
        <StyledScreen />
      </Shifter>
    </Banner>
  </StyledContainer>
);

const StyledContainer = styled(Container)`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[12]};
    display: none;

    ${media.greaterThan('md')`
      display: block;
    `}
  `}
`;

const Banner = styled(Stack)`
  ${({ theme }) => css`
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};

    ${media.greaterThan('md')`
      padding: ${theme.spacing[10]} ${theme.spacing[12]} 0 ${theme.spacing[12]};
    `}
  `}
`;

const Shifter = styled.div`
  height: 600px;
  width: 100%;
  overflow: hidden;
`;

const StyledScreen = styled(Screen)`
  position: absolute;
  bottom: -1px;
  left: 0;
  z-index: 1;
`;

export default DesktopBanner;
