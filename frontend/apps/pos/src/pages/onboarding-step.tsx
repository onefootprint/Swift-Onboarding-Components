import { useState } from 'react';
import AddressDataStep from './address-data-step';
import BasicDataStep from './basic-data-step';
import CustomDataStep from './custom-data-step';
import OtpStep from './otp-step';

const Onboarding = ({ onSuccess }) => {
  const [step, setStep] = useState('otp');
  const [onboardingData, setOnboardingData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    dob: '',
    country: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipcode: '',
    category: '',
    awd: '',
    reservedCarClass: '',
    elor: 0,
    rentalZone: '',
    under24hRental: false,
    businessLeisure: false,
    localMarketIndicator: false,
    distributionChannel: '',
  });

  const onSubmit = newData => {
    setOnboardingData(prevData => ({ ...prevData, ...newData }));
  };

  if (step === 'otp') {
    return (
      <OtpStep
        onSuccess={() => {
          setStep('basic-data');
        }}
      />
    );
  }
  if (step === 'basic-data') {
    return (
      <BasicDataStep
        onboardingData={onboardingData}
        onSubmit={data => {
          onSubmit(data);
          setStep('address-data');
        }}
      />
    );
  }
  if (step === 'address-data') {
    return (
      <AddressDataStep
        onboardingData={onboardingData}
        onGoBack={() => {
          setStep('basic-data');
        }}
        onSubmit={data => {
          onSubmit(data);
          setStep('custom-data');
        }}
      />
    );
  }
  if (step === 'custom-data') {
    return (
      <CustomDataStep
        onboardingData={onboardingData}
        onGoBack={() => {
          setStep('address-data');
        }}
        onSubmit={data => {
          onSubmit(data);
          onSuccess();
        }}
      />
    );
  }
};

export default Onboarding;
