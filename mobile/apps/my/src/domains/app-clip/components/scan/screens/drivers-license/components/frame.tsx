import styled, { css } from '@onefootprint/styled';
import { Dimensions } from 'react-native';
import Reanimated from 'react-native-reanimated';

const windowWidth = Dimensions.get('window').width;

const Frame = styled(Reanimated.View)`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.large};
    border: ${theme.borderWidth[2]} solid ${theme.borderColor.primary};
    height: 220px;
    position: absolute;
    width: ${windowWidth - 32}px;
    z-index: 1;
  `}
`;

export default Frame;
