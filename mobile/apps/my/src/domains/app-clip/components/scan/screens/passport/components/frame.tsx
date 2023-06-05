import styled, { css } from '@onefootprint/styled';
import Reanimated from 'react-native-reanimated';

const Frame = styled(Reanimated.View)`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.large};
    border: ${theme.borderWidth[2]} solid ${theme.borderColor.primary};
    height: 220px;
    position: absolute;
    width: 190px;
    z-index: 1;
  `}
`;

export default Frame;
