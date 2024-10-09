import type { Icon } from '@onefootprint/icons';
import { IcoClose24 } from '@onefootprint/icons';
import * as DrawerPrimitive from '@radix-ui/react-dialog';
import styled, { css } from 'styled-components';

import IconButton from '../../../icon-button';
import Text from '../../../text';

type HeaderProps = {
  closeAriaLabel?: string;
  closeIconComponent?: Icon;
  onClose: () => void;
  children: string;
};

const Header = ({
  closeAriaLabel = 'Close',
  closeIconComponent: CloseIconComponent = IcoClose24,
  onClose,
  children,
}: HeaderProps) => (
  <Container>
    <CloseContainer>
      <DrawerPrimitive.Close asChild>
        <IconButton aria-label={closeAriaLabel} onClick={onClose}>
          <CloseIconComponent />
        </IconButton>
      </DrawerPrimitive.Close>
    </CloseContainer>
    <TitleContainer>
      <DrawerPrimitive.Title asChild>
        <Text variant="label-2" tag="h2" width="100%" textAlign="center" truncate>
          {children}
        </Text>
      </DrawerPrimitive.Title>
    </TitleContainer>
  </Container>
);

export default Header;

const Container = styled.header`
  ${({ theme }) => css`
    display: grid;
    grid-template-columns: 32px 1fr 32px;
    grid-template-rows: 1fr;
    grid-template-areas: 'close title empty';
    grid-column-gap: ${theme.spacing[3]};
    align-items: center;
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    flex-shrink: 0;
    height: 52px;
    position: relative;
    width: 100%;
  `}
`;

const CloseContainer = styled.div`
  ${({ theme }) => css`
    position: absolute;
    left: ${theme.spacing[3]};
  `}
`;

const TitleContainer = styled.div`
  overflow: hidden;
  grid-area: title;
  justify-self: center;
  width: 100%;
`;
