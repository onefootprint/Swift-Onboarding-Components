import {
  CcAmex24,
  CcCodeFront24,
  CcDiners24,
  CcDiscover24,
  CcMaestro24,
  CcMastercard24,
  CcUnionpay24,
  CcVisa24,
} from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { motion } from 'framer-motion';
import React from 'react';

type CardIconProps = {
  brand?: string;
};

const cardIcons: Record<string, JSX.Element> = {
  amex: <CcAmex24 />,
  dinersclub: <CcDiners24 />,
  discover: <CcDiscover24 />,
  jcb: <CcCodeFront24 />,
  maestro: <CcMaestro24 />,
  mastercard: <CcMastercard24 />,
  unionpay: <CcUnionpay24 />,
  visa: <CcVisa24 />,
  visaelectron: <CcCodeFront24 />,
  forbrugsforeningen: <CcCodeFront24 />,
  dankort: <CcCodeFront24 />,
};

const CardIcon = ({ brand }: CardIconProps) =>
  brand ? (
    <IconContainer
      animate={{ opacity: 1, y: 0 }}
      aria-label={brand}
      initial={{ opacity: 0, y: 10 }}
      key={brand}
      role="img"
      transition={{ duration: 0.2 }}
    >
      {cardIcons[brand] && cardIcons[brand]}
    </IconContainer>
  ) : (
    <IconContainer>
      <CcCodeFront24 />
    </IconContainer>
  );

const IconContainer = styled(motion.div)`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    height: 100%;
    padding-right: ${theme.spacing[5]};
  `}
`;

export default CardIcon;
