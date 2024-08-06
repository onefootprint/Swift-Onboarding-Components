import {
  CcAmex24,
  CcCodeFront24,
  CcDiners24,
  CcDiscover24,
  CcJcb24,
  CcMaestro24,
  CcMastercard24,
  CcUnionpay24,
  CcVisa24,
} from '@onefootprint/icons';
import styled, { css } from 'styled-components';

type CardIconProps = {
  brand?: string;
};

const cardIcons: Record<string, JSX.Element> = {
  amex: <CcAmex24 />,
  dinersclub: <CcDiners24 />,
  discover: <CcDiscover24 />,
  jcb: <CcJcb24 />,
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
    <IconContainer aria-label={brand} role="img">
      {cardIcons[brand] && cardIcons[brand]}
    </IconContainer>
  ) : (
    <IconContainer>
      <CcCodeFront24 />
    </IconContainer>
  );

const IconContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    height: 100%;
    padding-right: ${theme.spacing[5]};
  `}
`;

export default CardIcon;
