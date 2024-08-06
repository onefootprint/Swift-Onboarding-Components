import { Box, Shimmer } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

const InitShimmer = () => (
  <Box testID="init-shimmer">
    <NavHeader />
    <TitleContainer>
      <Title />
      <Subtitle />
    </TitleContainer>
    <Box marginBottom={5}>
      <Label />
      <Input />
    </Box>
    <Button />
    <TermsOfService />
  </Box>
);

const TitleContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-bottom: ${theme.spacing[3]};
  `}
`;

const NavHeader = styled.div`
  width: 100%;
  height: var(--navigation-header-height);
`;

const Title = () => <Shimmer height="28px" width="120px" marginBottom={3} />;

const Subtitle = () => <Shimmer height="24px" width="228px" />;

const Label = () => <Shimmer height="20px" width="37px" marginBottom={3} />;

const Input = () => <Shimmer height="40px" width="100%" />;

const Button = () => <Shimmer height="48px" width="100%" marginBottom={5} />;

const TermsOfService = () => <Shimmer height="30px" width="100%" />;

export default InitShimmer;
