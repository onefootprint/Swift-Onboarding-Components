import { Stack, Text } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

export type RuleTagProps = {
  signal: string;
  op: 'is' | 'is not';
  list?: string;
  $elevated?: boolean;
};

const RuleTag = ({ signal, op, list, $elevated }: RuleTagProps) => (
  <Container direction="row" gap={3} $elevated={$elevated}>
    <Text variant="label-4">{signal}</Text>
    <Text variant="label-4">{op}</Text>
    {list ? (
      <>
        <Text variant="body-4" color="tertiary">
          in
        </Text>
        <Text variant="body-4">{list}</Text>
      </>
    ) : (
      <Text variant="body-4">triggered</Text>
    )}
  </Container>
);

const Container = styled(Stack)<{ $elevated?: boolean }>`
  ${({ theme, $elevated }) => css`
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.full};
    padding: ${theme.spacing[1]} ${theme.spacing[4]};
    background-color: ${theme.backgroundColor.primary};
    box-shadow: ${$elevated ? theme.elevation[2] : 'none'};
  `}
`;

export default RuleTag;
