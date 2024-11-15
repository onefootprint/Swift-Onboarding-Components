import { IcoChevronDown24, type Icon } from '@onefootprint/icons';
import { Stack, Text } from '@onefootprint/ui';
import * as RadixCollapsible from '@radix-ui/react-collapsible';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import styled, { css } from 'styled-components';

const { Root: CollapsibleRoot, Trigger: CollapsibleTrigger, Content: CollapsibleContent } = RadixCollapsible;

type CollapsibleSectionProps = {
  icon: Icon;
  title: string;
  children: React.ReactNode;
};

const CollapsibleSection = ({ icon: Icon, title, children }: CollapsibleSectionProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Stack direction="column" gap={3} align="flex-start" width="100%">
      <CollapsibleRoot className="CollapsibleRoot" open={open} onOpenChange={setOpen} asChild>
        <Container layoutRoot>
          <StyledTrigger>
            <Stack gap={2} align="center" justify="flex-start">
              <Icon />
              <Text variant="label-2">{title}</Text>
            </Stack>
            <IconContainer data-open={open}>
              <IcoChevronDown24 />
            </IconContainer>
          </StyledTrigger>
          <AnimatePresence>
            {open && (
              <CollapsibleContent forceMount asChild>
                <ChildContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {children}
                </ChildContainer>
              </CollapsibleContent>
            )}
          </AnimatePresence>
        </Container>
      </CollapsibleRoot>
    </Stack>
  );
};

const Container = styled(motion.div)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    width: 100%;
    gap: ${theme.spacing[2]};
  `};
`;

const StyledTrigger = styled(CollapsibleTrigger)`
  ${({ theme }) => css`
    all: unset;
    gap: ${theme.spacing[2]};
    padding: ${theme.spacing[4]};
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;

    &:hover {
      background-color: ${theme.backgroundColor.secondary};
    }
  `};
`;

const IconContainer = styled(Stack)`
  transition: transform 0.2s;

  &[data-open='true'] {
    transform: rotate(-180deg);
  }
`;

const ChildContainer = styled(motion.div)`
  ${({ theme }) => css`
    padding: 0 ${theme.spacing[4]} ${theme.spacing[4]} ${theme.spacing[4]};
  `};
`;

export default CollapsibleSection;
