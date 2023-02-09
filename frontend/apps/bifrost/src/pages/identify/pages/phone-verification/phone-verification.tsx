import {
  HeaderTitle,
  NavigationHeader,
} from '@onefootprint/footprint-elements';
import { useTranslation } from '@onefootprint/hooks';
import {
  Box,
  getCountryByNumber,
  getNumberByCountryValue,
} from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import { Events } from '../../../../utils/state-machine/identify/types';
import useIdentifyMachine from '../../hooks/use-identify-machine';
import PhoneVerificationLoading from './components/phone-verification-loading';
import PhoneVerificationPinForm from './components/phone-verification-pin-form';
import PhoneVerificationSuccess from './components/phone-verification-success';

const PhoneVerification = () => {
  const { t } = useTranslation('pages.phone-verification');
  const [state, send] = useIdentifyMachine();
  const { context } = state;
  const { phone, challengeData, userFound } = context;

  let phoneCountryCode = '';
  const filteredPhone = phone?.split('#')[0] ?? ''; // Filter out sandbox suffixes
  if (challengeData?.phoneCountryCode) {
    phoneCountryCode = challengeData?.phoneCountryCode;
  } else if (phone) {
    const phoneCountryVal = getCountryByNumber(filteredPhone).value;
    phoneCountryCode = getNumberByCountryValue(phoneCountryVal);
  }
  const phoneNumberLastTwo =
    challengeData?.phoneNumberLastTwo ?? filteredPhone.slice(-2);

  return (
    <>
      <NavigationHeader
        button={{
          variant: 'back',
          onClick: () => {
            send(Events.navigatedToPrevPage);
          },
        }}
      />
      <Form autoComplete="off" role="presentation">
        <Box>
          <HeaderTitle
            data-private
            title={userFound ? t('title.existing-user') : t('title.new-user')}
            subtitle={t('subtitle', {
              phoneCountryCode,
              phoneNumberLastTwo,
            })}
          />
        </Box>
        <PhoneVerificationPinForm
          renderLoadingComponent={PhoneVerificationLoading}
          renderSuccessComponent={PhoneVerificationSuccess}
        />
      </Form>
    </>
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
