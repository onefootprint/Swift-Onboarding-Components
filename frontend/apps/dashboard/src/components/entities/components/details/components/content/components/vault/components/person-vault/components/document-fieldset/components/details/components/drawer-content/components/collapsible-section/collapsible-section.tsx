import { IcoChevronDown24 } from '@onefootprint/icons';
import type { RawJsonKinds } from '@onefootprint/types';
import { CodeBlock, Stack, Text } from '@onefootprint/ui';
import * as RadixCollapsible from '@radix-ui/react-collapsible';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import getJsonKindText from './utils/get-json-kind-text';

const { Root: CollapsibleRoot, Trigger: CollapsibleTrigger, Content: CollapsibleContent } = RadixCollapsible;

type CollapsibleSectionProps = {
  rawJsonKind: RawJsonKinds;
  rawJsonData: string;
};

const CollapsibleSection = ({ rawJsonKind, rawJsonData }: CollapsibleSectionProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'fieldset.documents.details.raw-json-data',
  });
  const [open, setOpen] = useState(false);

  return (
    <Stack direction="column" gap={3} align="flex-start" width="100%">
      <CollapsibleRoot className="CollapsibleRoot" open={open} onOpenChange={setOpen} asChild>
        <JsonContainer layoutRoot>
          <StyledTrigger>
            <Text variant="body-3">{getJsonKindText(rawJsonKind)}</Text>
            <IconContainer data-open={open}>
              <IcoChevronDown24 />
            </IconContainer>
          </StyledTrigger>
          <AnimatePresence>
            {open && (
              <CollapsibleContent forceMount asChild>
                <CodeBlockContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <CodeBlock language="javascript" disableCopy title={t('json')}>
                    {rawJsonData}
                  </CodeBlock>
                </CodeBlockContainer>
              </CollapsibleContent>
            )}
          </AnimatePresence>
        </JsonContainer>
      </CollapsibleRoot>
    </Stack>
  );
};

const JsonContainer = styled(motion.div)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    width: 100%;
  `};
`;

const StyledTrigger = styled(CollapsibleTrigger)`
  ${({ theme }) => css`
    all: unset;
    gap: ${theme.spacing[2]};
    padding: ${theme.spacing[5]};
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

const CodeBlockContainer = styled(motion.div)`
  ${({ theme }) => css`
    & > div {
      border-radius: 0;
      border: none;

      header {
        background-color: transparent;
        border-top: ${theme.borderWidth[1]} dashed ${theme.borderColor.tertiary};
        border-bottom: ${theme.borderWidth[1]} dashed
          ${theme.borderColor.tertiary};
      }
    }
  `};
`;

export default CollapsibleSection;
