import { useTranslation } from 'hooks';
import React from 'react';
import HeaderTitle from 'src/components/header-title';
import NavigationHeader from 'src/components/navigation-header';
import useBifrostMachine, { Events } from 'src/hooks/use-bifrost-machine';
import styled, { css } from 'styled-components';
import { Box } from 'ui';

import PhoneVerificationLoading from './components/phone-verification-loading';
import PhoneVerificationPinForm from './components/phone-verification-pin-form';
import PhoneVerificationSuccess from './components/phone-verification-success';

const PhoneVerification = () => {
  const { t } = useTranslation('pages.phone-verification');
  const [state, send] = useBifrostMachine();
  const phoneNumberLastTwo =
    state.context.challenge?.phoneNumberLastTwo ??
    state.context.phone?.slice(-2);

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
      <Form>
        <Box>
          <HeaderTitle
            title={
              state.context.userFound
                ? t('title.existing-user')
                : t('title.new-user')
            }
            subtitle={t('subtitle', { phoneNumberLastTwo })}
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
    row-gap: ${theme.spacing[8]}px;
    justify-content: center;
    align-items: center;
    text-align: center;
  `}
`;

export default PhoneVerification;
