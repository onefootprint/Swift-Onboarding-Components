import { Container, media } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

import Header from '../header';
import BifrostModals from './components/bifrost-modals';

type MobileBannerProps = {
  title: string;
  subtitle: string;
  className?: string;
};

const MobileBanner = ({ title, subtitle, className }: MobileBannerProps) => (
  <StyledContainer className={className}>
    <Header title={title} subtitle={subtitle} />
    <IllustrationContainer>
      <BifrostModals />
    </IllustrationContainer>
  </StyledContainer>
);

const StyledContainer = styled(Container)`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[12]};
    display: flex;
    flex-direction: column;

    ${media.greaterThan('md')`
      display: none;
    `};
  `}
`;

const IllustrationContainer = styled.div`
  height: 600px;
  width: 100%;
  position: relative;

  &:after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: url(/auth/make-it-yours/background.svg);
    background-size: 24px;
    background-repeat: repeat;
    background-position: center;
    mask: radial-gradient(
      80% 80% at 50% 50%,
      rgba(0, 0, 0, 0.5) 0%,
      transparent 50%
    );
    mask-type: alpha;
  }
`;

export default MobileBanner;
