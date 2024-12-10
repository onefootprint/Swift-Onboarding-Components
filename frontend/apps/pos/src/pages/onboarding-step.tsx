import { useState } from 'react';
import { useForm } from 'react-hook-form';
import AddressDataStep from './address-data-step';
import BasicDataStep from './basic-data-step';
import CustomDataStep from './custom-data-step';
import OtpStep from './otp-step';

type FormData = {
  firstName: string;
  middleName: string;
  lastName: string;
  dob: string;
  country: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipcode: string;
  category: string;
  awd: string;
  reservedCarClass: string;
  elor: number;
  rentalZone: string;
  under24hRental: boolean;
  businessLeisure: boolean;
  localMarketIndicator: boolean;
  distributionChannel: string;
};

const Onboarding = ({ onSuccess }) => {
  const [step, setStep] = useState('otp');
  const { watch, setValue } = useForm<FormData>({
    defaultValues: {
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
    },
  });
  const formData = watch();

  const onSubmit = (newData: Partial<FormData>) => {
    Object.entries(newData).forEach(([key, value]) => {
      setValue(key as keyof FormData, value);
    });
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
        onboardingData={formData}
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
        onboardingData={formData}
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
        onboardingData={formData}
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
