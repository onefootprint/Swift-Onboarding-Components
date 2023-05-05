import { IcoCreditcard24, IcoIdCard24, IcoPin24 } from '@onefootprint/icons';
import { createFontStyles, media } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import HorizontalBeam from '../components/horizontal-beam';
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
    <Beams>
      <HorizontalBeam
        width={600}
        height={80}
        speed={6}
        delay={0}
        path="M-1.52588e-05 1H173C177.418 1 181 4.5817 181 8.99997L181 39C181 43.4183 184.582 47 189 47H286.329H430.21C434.628 47 438.21 43.4183 438.21 39V22.2593C438.21 17.841 441.792 14.2593 446.21 14.2593H600"
        className="beam-1"
      />
      <HorizontalBeam
        width={600}
        height={120}
        speed={4}
        delay={2}
        path="M0 1H155C159.418 1 163 4.58172 163 9V16.5C163 20.9183 166.582 24.5 171 24.5H393.333C397.752 24.5 401.333 28.0817 401.333 32.5L401.333 36C401.333 40.4183 404.915 44 409.333 44H472C476.418 44 480 40.4183 480 36L480 9.00001C480 4.58173 483.582 1 488 1H600"
        className="beam-2"
      />
      <HorizontalBeam
        width={600}
        height={120}
        speed={4}
        delay={4}
        path="M0 80H178.5C182.918 80 186.5 76.4183 186.5 72L186.5 8.99998C186.5 4.58171 190.082 1 194.5 1H233.88C238.299 1 241.88 4.58172 241.88 9V15.8288C241.88 20.2471 245.462 23.8288 249.88 23.8288H432.245C436.663 23.8288 440.245 27.4105 440.245 31.8288V54.3976C440.245 58.8159 443.826 62.3976 448.245 62.3976H600"
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

    ${media.greaterThan('sm')`
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 240px;
      margin: ${theme.spacing[8]} 0 ${theme.spacing[10]} 0;
  `}

    ${media.greaterThan('lg')`
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
      top: 40px;
      right: 0;
    }

    &[data-id='token-snn'] {
      top: 30px;
      left: 0;
    }

    &[data-id='credit-card'] {
      top: 132px;
      right: 0;
    }

    &[data-id='token-cc'] {
      top: 132px;
      left: 0;
    }

    &[data-id='address'] {
      top: 200px;
      right: 0;
    }

    &[data-id='token-address'] {
      top: 224px;
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
    top: 90%;
  }
`;

export default TabletIllustration;
