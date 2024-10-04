import {
  IcoAmex24,
  IcoCreditcard24,
  IcoDiners24,
  IcoDiscover24,
  IcoJcb24,
  IcoMastercard24,
  IcoUnionpay24,
  IcoVisa24,
  IcoVisaelectron24,
} from '@onefootprint/icons';
import { motion } from 'framer-motion';
import styled, { css } from 'styled-components';

type CardIconProps = {
  issuer?: string;
};

const cardIcons: Record<string, JSX.Element> = {
  amex: <IcoAmex24 />,
  dinersclub: <IcoDiners24 />,
  discover: <IcoDiscover24 />,
  jcb: <IcoJcb24 />,
  mastercard: <IcoMastercard24 />,
  master_card: <IcoMastercard24 />,
  unionpay: <IcoUnionpay24 />,
  visa: <IcoVisa24 />,
  visaelectron: <IcoVisaelectron24 />,
};

const CardIcon = ({ issuer }: CardIconProps) =>
  issuer ? (
    <IconContainer aria-label={issuer} key={issuer} role="img">
      {cardIcons[issuer] && cardIcons[issuer]}
    </IconContainer>
  ) : (
    <IconContainer>
      <IcoCreditcard24 />
    </IconContainer>
  );

const IconContainer = styled(motion.div)`
  ${() => css`
    align-items: center;
    display: flex;
    height: 100%;
  `}
`;

export default CardIcon;
