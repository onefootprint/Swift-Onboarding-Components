import { Box, Text } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

type TagProps = {
  text: string;
};

const Tag = ({ text }: TagProps) => {
  return (
    <Container>
      <Text variant="snippet-2" color="tertiary">
        #
      </Text>
      <Text variant="snippet-2" color="primary">
        {text}
      </Text>
    </Container>
  );
};

const Container = styled(Box)`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[2]};
    padding: ${theme.spacing[1]} ${theme.spacing[2]};
  `}
`;

export default Tag;
