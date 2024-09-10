import { Box, Shimmer } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

type LoadingProps = { children?: JSX.Element | null };

const Loading = ({ children }: LoadingProps): JSX.Element => (
  <Box testID="identify-init-shimmer">
    <NavHeader />
    <TitleContainer>
      <Shimmer height="28px" width="120px" marginBottom={3} />
      <Shimmer height="24px" width="228px" marginBottom={3} />
    </TitleContainer>
    <Box marginBottom={7}>
      <Shimmer height="20px" width="37px" marginBottom={3} />
      <Shimmer height="40px" width="100%" />
    </Box>
    <Shimmer height="40px" width="100%" marginBottom={5} />
    <Shimmer height="30px" width="100%" />
    {children}
  </Box>
);

const TitleContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-bottom: ${theme.spacing[2]};
  `}
`;

const NavHeader = styled.div`
  width: 100%;
  height: var(--navigation-header-height);
`;

export default Loading;
