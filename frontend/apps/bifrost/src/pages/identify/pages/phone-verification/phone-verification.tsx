import { NavigationHeader } from '@onefootprint/footprint-elements';
import React from 'react';
import styled, { css } from 'styled-components';

import { Events } from '../../../../utils/state-machine/identify/types';
import useIdentifyMachine from '../../hooks/use-identify-machine';
import PhoneVerificationForm from './components/phone-verification-form';
import PhoneVerificationHeader from './components/phone-verification-header';

const PhoneVerification = () => {
  const [state, send] = useIdentifyMachine();
  const { context } = state;
  const {
    identify: { phoneNumber: phone, userFound },
    challenge: { challengeData },
  } = context;

  const onNavigateToPrev = () => {
    send(Events.navigatedToPrevPage);
  };

  return (
    <Form autoComplete="off" role="presentation">
      <NavigationHeader
        button={{
          variant: 'back',
          onClick: onNavigateToPrev,
        }}
      />
      <PhoneVerificationHeader
        phone={challengeData?.scrubbedPhoneNumber || phone}
        userFound={userFound}
      />
      <PhoneVerificationForm />
    </Form>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[8]};
    justify-content: center;
    align-items: center;
    text-align: center;
  `}
`;

export default PhoneVerification;
