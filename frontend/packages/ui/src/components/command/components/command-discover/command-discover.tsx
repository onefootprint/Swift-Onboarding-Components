import { IcoCloseSmall16 } from '@onefootprint/icons';
import { media } from '@onefootprint/ui';
import * as Portal from '@radix-ui/react-portal';
import { AnimatePresence, motion } from 'framer-motion';
import styled, { css } from 'styled-components';
import IconButton from '../../../icon-button';
import Text from '../../../text';

type CommandDiscoverProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

const CommandDiscover = ({ open, onClose, children }: CommandDiscoverProps) => {
  return (
    <Portal.Root>
      <AnimatePresence>
        {open && (
          <Container
            initial={{ translateX: '50%', opacity: 0 }}
            animate={{ translateX: '0%', opacity: 1, transition: { duration: 0.3, ease: 'easeInOut', delay: 0.2 } }}
            exit={{ translateX: '50%', opacity: 0, transition: { duration: 0.3, ease: 'easeInOut' } }}
          >
            <Text variant="caption-2" color="secondary">
              {children}
            </Text>
            <IconButton aria-label="Close" onClick={onClose} size="compact">
              <IcoCloseSmall16 color="secondary" />
            </IconButton>
          </Container>
        )}
      </AnimatePresence>
    </Portal.Root>
  );
};

const Container = styled(motion.div)`
  ${({ theme }) => css`
    display: none;

    ${media.greaterThan('md')`
      position: fixed;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: ${theme.spacing[3]};
      box-shadow: ${theme.elevation[1]};
      border-radius: ${theme.borderRadius.sm};
      padding: ${theme.spacing[2]} ${theme.spacing[4]};
      bottom: ${theme.spacing[3]};
      right: ${theme.spacing[3]};
      z-index: ${theme.zIndex.overlay};
      background-color: ${theme.backgroundColor.primary};
      transform-origin: bottom right;
    `}
  `}
`;

export default CommandDiscover;
