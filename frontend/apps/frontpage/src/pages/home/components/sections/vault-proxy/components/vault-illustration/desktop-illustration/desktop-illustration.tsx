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

const DesktopIllustration = () => (
  <Container>
    <Grid />
    <Beams>
      <HorizontalBeam
        width={950}
        height={175}
        speed={9}
        delay={0}
        path="M0 1H154.212C158.63 1 162.212 4.58172 162.212 9V69.3084C162.212 73.7267 165.793 77.3084 170.212 77.3084H572.894C577.312 77.3084 580.893 80.8901 580.893 85.3084V168C580.893 172.418 584.475 176 588.893 176H863"
        className="beam-1"
      />
      <HorizontalBeam
        width={950}
        height={145}
        speed={7}
        delay={3}
        path="M0 146H185.167C189.586 146 193.167 142.418 193.167 138V95C193.167 90.5817 196.749 87 201.167 87H545.902C550.32 87 553.902 83.4183 553.902 79V9C553.902 4.58172 557.483 1 561.902 1H935"
        className="beam-2"
      />
      <HorizontalBeam
        width={950}
        height={107}
        speed={5}
        delay={6}
        path="M0 86.8488H234.95C239.368 86.8488 242.95 83.2671 242.95 78.8488V9C242.95 4.58172 246.531 1 250.95 1H556.633C561.051 1 564.633 4.58172 564.633 9V100C564.633 104.418 568.215 108 572.633 108H906"
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

  ${media.greaterThan('lg')`
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 310px;
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
      border: ${theme.borderWidth[1]} solid ${primitives.Gray700};
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

export default DesktopIllustration;
