import { IcoCreditcard24, IcoIdCard24, IcoPin24 } from '@onefootprint/icons';
import { createFontStyles, media } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import HorizontalBeam from '../components/horizontal-beam';
import Knob from '../components/knob/knob';

const values = {
  cc: {
    value: '1234-5678-9012-3456',
    token: '{{ fp_id_Srd...SQq.ccn }}',
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
    <Beams>
      <HorizontalBeam
        width={900}
        height={178}
        speed={9}
        delay={0}
        path="M0 1H193.847C198.265 1 201.847 4.58172 201.847 8.99999L201.847 28.2593C201.847 32.6775 205.429 36.2593 209.847 36.2593H421.494C425.912 36.2593 429.494 39.841 429.494 44.2593L429.494 61C429.494 65.4183 433.076 69 437.494 69H649.315C653.734 69 657.315 65.4183 657.315 61V44.2593C657.315 39.841 660.897 36.2593 665.315 36.2593H900"
        className="beam-1"
      />
      <HorizontalBeam
        width={900}
        height={178}
        speed={7}
        delay={3}
        path="M3.05176e-05 79.5H141.58C145.999 79.5 149.58 75.9183 149.58 71.5L149.581 8.74071C149.581 4.32244 153.162 0.740738 157.581 0.740738H354.619C359.038 0.740738 362.619 4.32246 362.619 8.74074V15.5C362.619 19.9183 366.201 23.5 370.619 23.5H591.833C596.251 23.5 599.833 19.9183 599.833 15.5V8.74073C599.833 4.32245 603.415 0.740738 607.833 0.740738H652.001C656.419 0.740738 660.001 4.32246 660.001 8.74074V38C660.001 42.4183 663.583 46 668.001 46H899.501"
        className="beam-2"
      />
      <HorizontalBeam
        width={900}
        height={178}
        speed={5}
        delay={6}
        path="M1.52588e-05 1H172C176.418 1 180 4.58173 180 9.00002L180 65.5C180 69.9183 183.582 73.5 188 73.5H341.5C345.918 73.5 349.5 77.0817 349.5 81.5L349.5 88C349.5 92.4183 353.082 96 357.5 96H594C598.418 96 602 99.5817 602 104L602 110C602 114.418 605.582 118 610 118H712C716.418 118 720 114.418 720 110L720 9C720 4.58172 723.582 1 728 1H900"
        className="beam-3"
      />
    </Beams>
    <Knob width={160} />
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
    display: none;
    position: relative;
    user-select: none;
    pointer-events: none;

    ${media.greaterThan('lg')`
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 240px;
      margin: ${theme.spacing[8]} 0 ${theme.spacing[10]} 0;
  `}
  `};
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

    &[data-id='snn'] {
      top: 15px;
      right: 46px;
    }

    &[data-id='credit-card'] {
      top: 52px;
      right: 46px;
    }

    &[data-id='address'] {
      top: 145px;
      right: 46px;
    }

    &[data-id='token-snn'] {
      top: -19px;
      left: 0;
    }

    &[data-id='token-cc'] {
      top: 53px;
      left: 0;
    }

    &[data-id='token-address'] {
      top: 178px;
      left: 0;
    }
  `}
`;

const Beams = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;

  svg {
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .beam-1 {
    top: 35%;
  }

  .beam-2 {
    top: 85%;
  }

  .beam-3 {
    top: 65%;
  }
`;

export default DesktopIllustration;
