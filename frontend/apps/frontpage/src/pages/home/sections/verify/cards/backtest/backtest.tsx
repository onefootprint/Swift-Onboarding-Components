import { motion } from 'framer-motion';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { useHover } from 'usehooks-ts';

import BaseCard from '../../components/base-card';
import CardTitle from '../../components/card-title';
import StatusTable from './components/status-table';

const statusTableCardVariants = {
  initial: {
    rotate: 2,
    x: '32px',
    y: '0px',
    transformOrigin: 'top left',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  hover: {
    rotate: -2,
    x: '32px',
    y: '-8px',
    boxShadow: '0 10px 15px rgba(0, 0, 0, 0.2)',
  },
};

const Backtest = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isHover = useHover(cardRef);
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.verify.cards.backtest',
  });
  return (
    <BaseCard overflow="hidden" ref={cardRef}>
      <CardTitle title={t('title')} subtitle={t('subtitle')} />
      <TableContainer
        initial="initial"
        animate={isHover ? 'hover' : 'initial'}
        variants={statusTableCardVariants}
      >
        <StatusTable />
      </TableContainer>
    </BaseCard>
  );
};

const TableContainer = styled(motion.div)`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.lg};
  `}
`;

export default Backtest;
