import { IcoChevronRight16 } from '@onefootprint/icons';
import { Box, Stack } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

type InnerDrawerProps = {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
};

const InnerDrawer = ({ children, open, onClose }: InnerDrawerProps) => {
  return (
    <Container>
      <ChevronButtonContainer onClick={onClose}>
        <Stack
          alignItems="center"
          justifyContent="center"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <IcoChevronRight16 />
        </Stack>
      </ChevronButtonContainer>
      <Box display={open ? 'block' : 'none'}>{children}</Box>
    </Container>
  );
};

const Container = styled(Box)`
${({ theme }) => css`
    grid-area: drawer;
    display: flex;
    flex-direction: column;
    background-color: ${theme.backgroundColor.primary};
    border-right: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    position: relative;
`}
`;

const ChevronButtonContainer = styled(Box)`
${({ theme }) => css`
    position: absolute;
    top: ${theme.spacing[3]};
    right: 0;
    transform: translateX(100%);
    cursor: pointer;
    height: 32px;
    padding: ${theme.spacing[3]} ${theme.spacing[2]};
    border-radius: 0 ${theme.borderRadius.sm} ${theme.borderRadius.sm} 0;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${theme.backgroundColor.primary};

    &:hover {
      background-color: ${theme.backgroundColor.secondary};
    }
`}
`;

export default InnerDrawer;
