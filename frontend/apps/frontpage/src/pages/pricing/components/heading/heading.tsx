import { Container, Text, media } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

type HeadingProps = {
  title: string;
  subtitle: string;
};

const Heading = ({ title, subtitle }: HeadingProps) => (
  <StyledContainer>
    <Text color="primary" variant="display-2" tag="h1" textAlign="center" maxWidth="600px">
      {title}
    </Text>
    <Text color="secondary" variant="display-4" tag="p" textAlign="center" maxWidth="600px">
      {subtitle}
    </Text>
  </StyledContainer>
);

const StyledContainer = styled(Container)`
  ${({ theme }) => css`
    padding-top: ${theme.spacing[9]};
    padding-bottom: ${theme.spacing[9]};
    gap: ${theme.spacing[5]};
    align-items: center;

    ${media.greaterThan('md')`
      padding-top: ${theme.spacing[11]};
      padding-bottom: ${theme.spacing[10]};
    `}
  `}
`;

export default Heading;
