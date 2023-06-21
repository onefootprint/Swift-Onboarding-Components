import styled from '@onefootprint/styled';
import { createFontStyles } from '@onefootprint/ui';

const Strong = styled.span<{ children: string }>`
  ${createFontStyles('label-2')};
  color: currentColor;
`;

export default Strong;
