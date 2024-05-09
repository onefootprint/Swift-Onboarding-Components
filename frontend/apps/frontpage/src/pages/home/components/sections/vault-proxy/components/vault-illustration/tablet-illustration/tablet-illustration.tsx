import { primitives } from '@onefootprint/design-tokens';
import { IcoCreditcard16, IcoIdCard16, IcoPin16 } from '@onefootprint/icons';
import { createFontStyles, media } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import HorizontalBeam from '../../../../../../../../components/horizontal-beam';
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
    <Beams>
      <HorizontalBeam
        width={720}
        height={175}
        speed={9}
        delay={0}
        path="M0 1H127.333C131.751 1 135.333 4.58172 135.333 9V69.3084C135.333 73.7267 138.915 77.3084 143.333 77.3084H476.639C481.057 77.3084 484.639 80.8901 484.639 85.3084V168C484.639 172.418 488.221 176 492.639 176H720"
        className="beam-1"
      />
      <HorizontalBeam
        width={720}
        height={145}
        speed={7}
        delay={3}
        path="M0 146H140.749C145.167 146 148.749 142.418 148.749 138V95C148.749 90.5817 152.331 87 156.749 87H497.734C502.152 87 505.734 83.4183 505.734 79V9C505.734 4.58172 509.316 1 513.734 1H720"
        className="beam-2"
      />
      <HorizontalBeam
        width={720}
        height={107}
        speed={5}
        delay={6}
        path="M0 86.8488H185.073C189.491 86.8488 193.073 83.2671 193.073 78.8488V9C193.073 4.58172 196.654 1 201.073 1H440.715C445.133 1 448.715 4.58172 448.715 9V100C448.715 104.418 452.297 108 456.715 108H720"
        className="beam-3"
      />
    </Beams>
    <StyledKnob width={124} />
    <Labels>
      <Label data-id="snn">
        <IcoIdCard16 color="quinary" />
        {values.snn.value}
      </Label>
      <Label data-id="credit-card">
        <IcoCreditcard16 color="quinary" />
        {values.cc.value}
      </Label>
      <Label data-id="address">
        <IcoPin16 color="quinary" />
        {values.address.value}
      </Label>
      <Label data-id="token-snn">{values.snn.token}</Label>
      <Label data-id="token-cc">{values.cc.token}</Label>
      <Label data-id="token-address">{values.address.token}</Label>
    </Labels>
  </Container>
);

const Container = styled.div`
  display: none;
  position: relative;
  user-select: none;
  pointer-events: none;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 200%;
    height: 200%;
    background: radial-gradient(
      40% 90% at 50% 50%,
      rgba(75, 38, 218, 0.3) 0%,
      rgba(75, 38, 218, 0.08) 30%,
      rgba(75, 38, 218, 0.02) 45%,
      transparent 55%
    );
  }

  ${media.greaterThan('sm')`
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 310px;
  `};

  ${media.greaterThan('lg')`
    display: none;
  `};
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
      border: 1px solid ${primitives.Gray700};
      border-radius: ${theme.borderRadius.default};
    }

    &[data-id='snn'] {
      top: 22%;
      right: 40px;
    }

    &[data-id='credit-card'] {
      top: 73%;
      right: 0;
    }

    &[data-id='address'] {
      top: 95%;
      right: 46px;
    }

    &[data-id='token-snn'] {
      top: 69%;
      left: 0;
    }

    &[data-id='token-cc'] {
      top: 18%;
      left: 0;
    }

    &[data-id='token-address'] {
      top: 89%;
      left: 0;
    }
  `}
`;

const Beams = styled(Container)`
  position: relative;
  width: 100%;
  height: 100%;

  .beam-1 {
    position: absolute;
    top: 50%;
    left: 240px;
    transform: translateY(-50%);
  }

  .beam-2 {
    position: absolute;
    left: 180px;
    top: 50%;
    transform: translateY(-50%);
  }

  .beam-3 {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
  }
`;

const StyledKnob = styled(Knob)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const Labels = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
`;

export default TabletIllustration;
