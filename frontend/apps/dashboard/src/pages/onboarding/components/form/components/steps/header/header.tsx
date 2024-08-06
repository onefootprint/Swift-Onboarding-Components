import { Text } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

export type HeaderProps = {
  title: string;
  subtitle: string;
};

const Header = ({ title, subtitle }: HeaderProps) => (
  <Container>
    <Text variant="heading-3" marginBottom={3}>
      {title}
    </Text>
    <Text variant="body-2" color="secondary">
      {subtitle}
    </Text>
  </Container>
);

const Container = styled.header`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[8]};
  `}
`;

export default Header;
