import styled from 'styled-components';
import { createFontStyles } from 'ui';

const Strong = styled.span<{ children: string }>`
  ${createFontStyles('label-2')};
  color: currentColor;
`;

export default Strong;
