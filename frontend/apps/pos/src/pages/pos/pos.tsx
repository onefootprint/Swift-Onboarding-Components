import AddressStep from '@/components/address-step';
import BasicDataStep from '@/components/basic-data-step';
import EmailStep from '@/components/email-step';
import IntroStep from '@/components/intro-step';
import Layout from '@/components/layout';
import OtpStep from '@/components/otp-step';
import SuccessStep from '@/components/success-step';
import { initialState, reducer } from '@/utils/reducer';
import { useReducer } from 'react';

const Pos = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleHandoff = (phoneNumber: string) => {
    dispatch({ type: 'SET_USER_DATA', payload: { phoneNumber } });
    dispatch({ type: 'NEXT_STEP' });
  };

  const handleFillout = (phoneNumber: string) => {
    dispatch({ type: 'SET_USER_DATA', payload: { phoneNumber } });
    dispatch({ type: 'NEXT_STEP' });
  };

  return (
    <Layout>
      {state.currentStep === 'intro' && <IntroStep onHandoff={handleHandoff} onFillout={handleFillout} />}
      {state.currentStep === 'otp' && <OtpStep />}
      {state.currentStep === 'email' && <EmailStep />}
      {state.currentStep === 'basic-data' && <BasicDataStep />}
      {state.currentStep === 'address' && <AddressStep />}
      {state.currentStep === 'success' && <SuccessStep />}
    </Layout>
  );
};

export default Pos;
