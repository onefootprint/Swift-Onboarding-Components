import { primitives } from '@onefootprint/design-tokens';
import { IcoCreditcard24, IcoIdCard24, IcoPin24 } from '@onefootprint/icons';
import { createFontStyles, media } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import VerticalBeam from '../../../../../../../../components/vertical-beam';
import Grid from '../components/grid';
import Knob from '../components/knob';

const values = {
  cc: {
    value: '1234-5678-9012-3456',
    token: '{{ fp_id_Srd...SQq.card.number }}',
  },
  snn: {
    value: '123-45-6789',
    token: '{{ fp_id_Srd...SQq.id.ssn9 }}',
  },
  address: {
    value: '1234 Penguin St.',
    token: '{{ fp_id_Srd...SQq.address }}',
  },
};

const TabletIllustration = () => (
  <Container>
    <Grid />
    <VerticalBeam
      path="M1 0L1 95.0915C1 99.5098 4.58172 103.091 9 103.091H52C56.4183 103.091 60 106.673 60 111.091L60 287.612C60 292.03 63.5817 295.612 68 295.612H138C142.418 295.612 146 299.193 146 303.612V640"
      height={640}
      width={150}
      speed={9}
      delay={0}
      className="beam-1"
    />
    <VerticalBeam
      path="M176 0V85.7934C176 90.2116 172.418 93.7934 168 93.7934H107.692C103.273 93.7934 99.6916 97.3751 99.6916 101.793L99.6916 327.882C99.6916 332.3 96.1099 335.882 91.6916 335.882H8.99999C4.58172 335.882 1 339.463 1 343.882V600"
      height={600}
      width={180}
      speed={9}
      delay={0}
      className="beam-2"
    />
    <VerticalBeam
      path="M43.5233 0V126.346C43.5233 130.765 39.9415 134.346 35.5233 134.346H8.99999C4.58171 134.346 1 137.928 1 142.346L1 304.231C1 308.649 4.58172 312.231 9 312.231H46C50.4183 312.231 54 315.813 54 320.231L54 640"
      height={640}
      width={54}
      speed={9}
      delay={0}
      className="beam-3"
    />
    <Knob width={180} />
    <Label data-id="snn">
      <IcoIdCard24 color="quinary" />
      {values.snn.value}
    </Label>
    <Label data-id="credit-card">
      <IcoCreditcard24 color="quinary" />
      {values.cc.value}
    </Label>
    <Label data-id="address">
      <IcoPin24 color="quinary" />
      {values.address.value}
    </Label>
    <Label data-id="token-snn">{values.snn.token}</Label>
    <Label data-id="token-cc">{values.cc.token}</Label>
    <Label data-id="token-address">{values.address.token}</Label>
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 700px;
    margin: ${theme.spacing[8]} 0 ${theme.spacing[10]} 0;
    pointer-events: none;
    user-select: none;

    ${media.greaterThan('sm')`
      display: none;
    `}

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 200%;
      height: 200%;
      background: radial-gradient(
        70% 90% at 50% 50%,
        rgba(75, 38, 218, 0.3) 0%,
        rgba(75, 38, 218, 0.08) 30%,
        rgba(75, 38, 218, 0.02) 45%,
        transparent 55%
      );
    }

    .beam-2 {
      position: absolute;
      right: 40px;
      top: 10px;
    }

    .beam-1 {
      position: absolute;
      left: 24px;
      top: 84px;
    }

    .beam-3 {
      position: absolute;
      right: 90px;
      top: 140px;
    }
  `}
`;

const Label = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('snippet-2', 'code')}
    color: ${primitives.Gray0};
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    gap: ${theme.spacing[4]};
    background-color: ${primitives.Gray800};
    padding: ${theme.spacing[2]} ${theme.spacing[3]};
    border-radius: ${theme.borderRadius.full};
    opacity: 1;
    isolation: isolate;

    &::after {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      background-color: ${primitives.Gray800};
      z-index: -1;
      border: ${theme.borderWidth[1]} solid ${primitives.Gray700};
      border-radius: ${theme.borderRadius.default};
    }

    &[data-id='snn'] {
      bottom: 70px;
      transform: translateX(-50%);
      left: 50%;
    }

    &[data-id='credit-card'] {
      bottom: 160px;
      left: 0;
    }

    &[data-id='address'] {
      bottom: 0;
      right: 0;
    }

    &[data-id='token-snn'] {
      top: 60px;
      left: 0;
    }

    &[data-id='token-cc'] {
      top: 0;
      right: 0;
    }

    &[data-id='token-address'] {
      top: 140px;
      right: 0;
    }
  `}
`;

export default TabletIllustration;
