import { Stack, Text } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

type FieldProps = {
  label: string;
  firstString: string;
  diff?: string;
  secondString?: string;
  className?: string;
};

const Field = ({ label, firstString, diff, secondString, className }: FieldProps) => (
  <Stack direction="column" gap={3} className={className}>
    <Text variant="caption-1" color="tertiary">
      {label}
    </Text>
    <Stack direction="row" inline gap={2} align="center">
      <Text variant="body-4" color="secondary">
        {firstString}
      </Text>
      {diff && (
        <StyledDiff variant="label-4" color="error">
          {diff}
        </StyledDiff>
      )}
      {secondString && (
        <Text variant="body-4" color="primary">
          {secondString}
        </Text>
      )}
    </Stack>
  </Stack>
);

const StyledDiff = styled(Text)`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.error};
    border-radius: ${theme.borderRadius.default};
    padding: ${theme.spacing[1]};
    margin-right: -${theme.spacing[1]};
  `}
`;
export default Field;
