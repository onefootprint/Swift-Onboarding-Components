import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import styled, { css } from 'styled-components';

import { IcoCheckSmall16 } from '@onefootprint/icons';

const ItemIndicator = () => {
  return (
    <Container>
      <IcoCheckSmall16 color="primary" />
    </Container>
  );
};

const Container = styled(RadixDropdown.ItemIndicator)`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    height: ${theme.spacing[7]};
    width: ${theme.spacing[7]};
  `}
`;

export default ItemIndicator;
