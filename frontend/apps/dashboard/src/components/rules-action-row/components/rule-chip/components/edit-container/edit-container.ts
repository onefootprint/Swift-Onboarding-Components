import { Stack } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

const EditContainer = styled(Stack)`
  ${({ theme }) => css`
    height: fit-content;
    min-width: fit-content;
    align-items: center;
    border-radius: ${theme.borderRadius.full};
    background-color: ${theme.backgroundColor.secondary};
    padding: 0 ${theme.spacing[1]};
    overflow: hidden;
 

    .deleteIcon {
      margin-left: -${theme.spacing[1]};
      path {
        transition: fill 0.1s ease-in-out;
      }
    }

    &:hover {
      .deleteIcon {
        path {
          fill: ${theme.color.primary};
        }
      }
    }
  `}
`;

export default EditContainer;
