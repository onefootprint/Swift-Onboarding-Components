import { createFontStyles } from '@onefootprint/ui';
import styled from 'styled-components';

const Strong = styled.span<{ children: string }>`
  ${createFontStyles('label-2')};
  color: currentColor;
`;

export default Strong;
