import type { Icon } from '@onefootprint/icons';
import { Box, Stack, Text } from '@onefootprint/ui';
import { AnimatePresence, motion } from 'framer-motion';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

type CustomToggleProps = {
  onChange?: (option: string) => void;
  activeSection: string;
  sections: { value: string; labelKey: string; icon: Icon }[];
  className?: string;
};

export const CustomToggle = ({ onChange, activeSection, sections, className }: CustomToggleProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.verify.cards.verify.illustration',
  });

  return (
    <Container className={className}>
      <AnimatePresence>
        {sections.map(section => (
          <StyledOption as="button" onClick={() => onChange && onChange(section.value)} key={section.value}>
            {activeSection === section.value && (
              <SelectedMarker
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                layoutId="activeMarker"
                transition={{ duration: 0.2 }}
              />
            )}
            <Stack direction="row" gap={3} alignItems="center" zIndex={2}>
              <section.icon color={activeSection === section.value ? 'quinary' : 'primary'} />
              <Text variant="label-3" color={activeSection === section.value ? 'quinary' : 'primary'}>
                {t(section.labelKey as unknown as ParseKeys<'common'>)}
              </Text>
            </Stack>
          </StyledOption>
        ))}
      </AnimatePresence>
    </Container>
  );
};

const Container = styled(Stack)`
  ${({ theme }) => css`
    padding: ${theme.spacing[1]};
    flex-direction: row;
    border-radius: calc(${theme.borderRadius.default} + 2px);
    width: fit-content;
    overflow: hidden;
    background-color: ${theme.backgroundColor.primary};
    position: relative;
    isolation: isolate;
    box-shadow: ${theme.elevation[1]};
  `}
`;

const StyledOption = styled(Box)`
  ${({ theme }) => css`
    all: unset;
    position: relative;
    display: flex;
    align-items: center;
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    cursor: pointer;
    z-index: 1;
  `}
`;

const SelectedMarker = styled(motion.div)`
  ${({ theme }) => css`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${theme.backgroundColor.tertiary};
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
    z-index: 0;
  `}
`;

export default CustomToggle;
