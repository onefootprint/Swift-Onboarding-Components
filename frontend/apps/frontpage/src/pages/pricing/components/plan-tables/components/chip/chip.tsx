import styled, { css } from '@onefootprint/styled';
import { createFontStyles } from '@onefootprint/ui';

const Chip = styled.div<{ children: string }>`
  ${({ theme }) => css`
    padding: ${theme.spacing[1]} ${theme.spacing[4]};
    background-color: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.full};
    width: fit-content;
    ${createFontStyles('label-4')}

    &[data-transparent='true'] {
      background-color: transparent;
    }
  `}
`;

export default Chip;
