import { Stack } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

const Section = ({ children }: { children: React.ReactNode }) => {
  return (
    <Container marginBottom={7} direction="column">
      {children}
    </Container>
  );
};

const Container = styled(Stack)`
${({ theme }) => css`
  h3 {
    margin-bottom: ${theme.spacing[4]};
  }
  `}
`;

export default Section;
