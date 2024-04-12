import { IcoChevronDown24 } from '@onefootprint/icons';
import { RawJsonKinds } from '@onefootprint/types';
import { CodeBlock, Stack, Text } from '@onefootprint/ui';
import * as Collapsible from '@radix-ui/react-collapsible';
import { AnimatePresence, motion } from 'framer-motion';
import type { ParseKeys } from 'i18next';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

type CollapsibleSectionProps = {
  rawJsonKind: RawJsonKinds;
  rawJsonData: string;
};

const jsonKindToTranslationKey: Record<RawJsonKinds, string> = {
  [RawJsonKinds.CurpValidationResponse]: 'curp-validation-response',
};

const CollapsibleSection = ({
  rawJsonKind,
  rawJsonData,
}: CollapsibleSectionProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.fieldset.document.drawer.raw-json-data',
  });
  const [open, setOpen] = useState(false);

  return (
    <RawJsonDataContainer>
      <Collapsible.Root
        className="CollapsibleRoot"
        open={open}
        onOpenChange={setOpen}
        asChild
      >
        <JsonContainer layoutRoot>
          <StyledTrigger>
            <Text variant="body-3">
              {t(jsonKindToTranslationKey[rawJsonKind] as ParseKeys)}
            </Text>
            <IconContainer data-open={open}>
              <IcoChevronDown24 />
            </IconContainer>
          </StyledTrigger>
          <AnimatePresence>
            {open && (
              <Collapsible.Content forceMount asChild>
                <CodeBlockContainer
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <CodeBlock
                    language="javascript"
                    disableCopy
                    title={t('json')}
                  >
                    {rawJsonData}
                  </CodeBlock>
                </CodeBlockContainer>
              </Collapsible.Content>
            )}
          </AnimatePresence>
        </JsonContainer>
      </Collapsible.Root>
    </RawJsonDataContainer>
  );
};

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

const JsonContainer = styled(motion.div)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    width: 100%;
  `};
`;

const IconContainer = styled(Stack)`
  transition: transform 0.2s;
  &[data-open='true'] {
    transform: rotate(-180deg);
  }
`;

const StyledTrigger = styled(Collapsible.Trigger)`
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

const RawJsonDataContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[3]};
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  `};
`;

export default CollapsibleSection;
