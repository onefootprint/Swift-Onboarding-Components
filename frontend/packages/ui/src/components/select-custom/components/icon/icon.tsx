import { IcoChevronDown16 } from '@onefootprint/icons';
import * as RadixSelect from '@radix-ui/react-select';
import styled, { css } from 'styled-components';
const Icon = () => (
  <RadixSelect.Icon asChild>
    <IconContainer className="icon-component">
      <IcoChevronDown16 />
    </IconContainer>
  </RadixSelect.Icon>
);

const IconContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.color.tertiary};
  `}
`;

export default Icon;
