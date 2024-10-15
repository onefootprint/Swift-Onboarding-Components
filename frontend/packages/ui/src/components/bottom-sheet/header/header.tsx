import { IcoClose24 } from '@onefootprint/icons';
import * as RadixDialog from '@radix-ui/react-dialog';
import styled, { css } from 'styled-components';

import Box from '../../box';
import IconButton from '../../icon-button';
import Stack from '../../stack';
import Text from '../../text';

export const HEADER_HEIGHT = 52;

type HeaderProps = {
  title?: string;
  closeAriaLabel?: string;
  onClose?: () => void;
};

const Header = ({ title, closeAriaLabel = 'Close', onClose }: HeaderProps) => (
  <Container $hasBorder={!!title} flexGrow={0}>
    <RadixDialog.Close asChild>
      <Box>
        <IconButton aria-label={closeAriaLabel} onClick={onClose}>
          <IcoClose24 />
        </IconButton>
      </Box>
    </RadixDialog.Close>
    {title && (
      <Title>
        <Text variant="label-2">{title}</Text>
      </Title>
    )}
    <Box height="32px" width="32px" tag="span" />
  </Container>
);

const Container = styled(Stack)<{ $hasBorder: boolean }>`
  ${({ theme, $hasBorder }) => css`
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${theme.spacing[3]};
    width: 100%;

    ${
      $hasBorder &&
      css`
      border-bottom: 1px solid ${theme.borderColor.tertiary};
    `
    }
  `}
`;

const Title = styled(RadixDialog.Title)`
  display: flex;
  flex-grow: 1;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

export default Header;
