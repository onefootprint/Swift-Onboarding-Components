import { Box, Stack, Text } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { useHover } from 'usehooks-ts';

import BaseCard from '../../components/base-card';
import CardTitle from '../../components/card-title';
import GrabbedChip from './components/grabbed-chip';
import RulesTable from './components/rules-table';

const IllustrationMotionVariants = {
  initial: {
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transform: 'translateY(0px)',
  },
  hover: {
    boxShadow: '0 10px 15px rgba(0, 0, 0, 0.2)',
    transform: 'translateY(-5px)',
  },
};

const grabbedChipVariants = {
  initial: {
    x: '100%',
    y: '-200%',
    rotate: 0,
    opacity: 0.8,
    zIndex: 3,
  },
  hover: {
    x: '60%',
    y: '-50%',
    opacity: 1,
    rotate: -15,
    transition: {
      duration: 2,
      ease: 'easeInOut',
    },
  },
};

const BuildRules = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isHover = useHover(cardRef);
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.verify.cards.build-rules',
  });

  return (
    <BaseCard overflow="hidden" ref={cardRef}>
      <CardTitle title={t('title')} subtitle={t('subtitle')} />
      <Box position="relative" height="fit-content" minHeight="280px">
        <Illustration
          direction="column"
          gap={5}
          variants={IllustrationMotionVariants}
          animate={isHover ? 'hover' : 'initial'}
        >
          <Stack direction="column" gap={2}>
            <Text variant="label-1" color="error">
              Fail
            </Text>
            <Text variant="body-2" color="secondary">
              User will be marked as failed
            </Text>
          </Stack>
          <RulesTable />
        </Illustration>
        <motion.div variants={grabbedChipVariants} initial="initial" animate={isHover ? 'hover' : 'initial'}>
          <GrabbedChip />
        </motion.div>
      </Box>
    </BaseCard>
  );
};

const Illustration = styled(motion(Stack))`
  ${({ theme }) => css`
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.lg};
    padding: ${theme.spacing[7]};
    overflow: hidden;
    background-color: ${theme.backgroundColor.primary};
    position: absolute;
    left: ${theme.spacing[8]};
    top: 0;
    width: 720px;
    box-shadow: ${theme.elevation[1]};
  `}
`;

export default BuildRules;
