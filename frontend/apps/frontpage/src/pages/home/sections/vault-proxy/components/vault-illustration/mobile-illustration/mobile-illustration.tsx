import { IcoCreditcard24, IcoIdCard24 } from '@onefootprint/icons';
import { createFontStyles, media } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import Knob from '../components/knob/knob';
import VerticalBeam from '../components/vertical-beam';

const values = {
  cc: {
    value: '1234-5678-9012-3456',
    token: '{{ fp_id_Srd...SQq.ccn }}',
  },
  snn: {
    value: '123-45-6789',
    token: '{{ fp_id_Srd...SQq.id.ssn9 }}',
  },
};

const MobileIllustration = () => (
  <Container>
    <Beams>
      <VerticalBeam
        width={120}
        height={280}
        speed={6}
        delay={0}
        path="M34 -1.52588e-05V30.5C34 34.9183 30.4183 38.5 26 38.5H9C4.58172 38.5 1 42.0817 1 46.5V98C1 102.418 4.58173 106 9.00002 106L43 106C47.4183 106 51 109.582 51 114L51 185.5C51 189.918 54.5817 193.5 59 193.5H77.5C81.9183 193.5 85.5 197.082 85.5 201.5L85.5 238.5"
        className="beam-1"
      />
      <VerticalBeam
        width={120}
        height={280}
        speed={6}
        delay={0}
        path="M1 240L1 175.6C1 171.182 4.58173 167.6 9.00001 167.6L92 167.6C96.4183 167.6 100 164.018 100 159.6V125.468L100 72.716C100 68.2977 96.4183 64.716 92 64.716H58.66C54.2417 64.716 50.66 61.1343 50.66 56.716V0"
        className="beam-2"
      />
    </Beams>
    <Knob width={120} />
    <Label data-id="snn">
      <IcoIdCard24 color="quinary" />
      {values.snn.value}
    </Label>
    <Label data-id="credit-card">
      <IcoCreditcard24 color="quinary" />
      {values.cc.value}
    </Label>
    <Label data-id="token-snn">{values.snn.token}</Label>
    <Label data-id="token-cc">{values.cc.token}</Label>
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    position: relative;
    user-select: none;
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 240px;
    margin: ${theme.spacing[8]} 0 ${theme.spacing[10]} 0;

    ${media.greaterThan('sm')`
    display: none;
  `}
  `}
`;

const Label = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('snippet-2')}
    color: ${theme.color.quinary};
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    gap: ${theme.spacing[4]};
    background-color: rgba(255, 255, 255, 0.1);
    padding: ${theme.spacing[2]} ${theme.spacing[3]};
    border-radius: ${theme.borderRadius.full};
    opacity: 1;
    isolation: isolate;
    opacity: 0.8;

    &::after {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      background-color: ${theme.backgroundColor.tertiary};
      z-index: -1;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: ${theme.borderRadius.default};
    }

    &[data-id='credit-card'] {
      top: 20px;
      right: 10%;
    }

    &[data-id='token-cc'] {
      top: 280px;
      right: 10%;
    }

    &[data-id='snn'] {
      top: -20px;
      left: 0%;
    }

    &[data-id='token-snn'] {
      top: 240px;
      left: 0%;
    }
  `}
`;

const Beams = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;

  svg {
    position: absolute;
  }

  .beam-1 {
    top: 20%;
    right: 10%;
  }

  .beam-2 {
    top: 0%;
    left: 12%;
    transform: scaleX(1);
  }
`;

export default MobileIllustration;
