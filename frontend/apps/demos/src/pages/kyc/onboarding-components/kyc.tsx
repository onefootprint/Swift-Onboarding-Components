import { Fp } from '@onefootprint/footprint-react';
import { Stack, Stepper } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';
import GeolocationEvent from './components/geolocation-event';
import InputEvent from './components/input-event';

import { OverallOutcome } from '@onefootprint/types';
import ContentLayout from './components/content-layout';
import Header from './components/header';
import GlobalStyles from './kyc.styles';
import { EventVariant, type GeolocationEventProps, type InputEventProps, type NativeEvent } from './kyc.types';
import Confirmation from './steps/confirmation';
import Identify from './steps/identify';
import PersonalInformation from './steps/personal-information';

const steps = [
  {
    label: 'Identify',
    value: 'identify',
    component: Identify,
  },
  {
    label: 'Personal information',
    value: 'basic-data',
    component: PersonalInformation,
  },
  {
    label: 'Confirmation',
    value: 'confirmation',
    component: Confirmation,
  },
];

const publicKeyEnv = process.env.NEXT_PUBLIC_KYC_KEY || 'pb_test_DOBM63fG6uDzNUj62SRJkF';
const LOCATION_API_URL = 'https://ipapi.co/json/';
const TOAST_OPTIONS = { duration: Number.POSITIVE_INFINITY, dismissible: false };

const outcomeMap = {
  s: OverallOutcome.success,
  mr: OverallOutcome.manualReview,
  ro: OverallOutcome.useRulesOutcome,
  f: OverallOutcome.fail,
};

const Demo = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showLogs, setShowLogs] = useState(true);
  const router = useRouter();
  const { ob_key: obKey, o } = router.query;
  const publicKey = typeof obKey === 'string' ? obKey : publicKeyEnv;

  const sandboxOutcome = { overallOutcome: outcomeMap[o as keyof typeof outcomeMap] || OverallOutcome.fail };

  const handleShowLogs = useCallback(() => {
    setShowLogs(prevShowLogs => !prevShowLogs);
  }, []);

  const recordInputEvent = useCallback((e: NativeEvent) => {
    const variant: EventVariant = EventVariant.INPUT;
    const { type, target, nativeEvent } = e;
    const { value, name } = target as HTMLInputElement;
    const createdAt: Date = new Date();
    const isAutoCompleted: boolean = !(nativeEvent instanceof window.InputEvent);
    const isPaste: boolean = nativeEvent instanceof ClipboardEvent;
    const event: InputEventProps = { type, value, name, createdAt, isAutoCompleted, isPaste, variant };
    toast(<InputEvent event={event} />, TOAST_OPTIONS);
  }, []);

  const recordGeolocationEvent = useCallback((event: GeolocationEventProps) => {
    const createdAt: Date = new Date();
    toast(<GeolocationEvent {...event} createdAt={createdAt} />, TOAST_OPTIONS);
  }, []);

  const CurrentComponent = steps[currentStep].component;

  const handleSubmit = useCallback(() => {
    setCurrentStep(prevStep => prevStep + 1);
  }, []);

  useEffect(() => {
    fetch(LOCATION_API_URL)
      .then(response => response.json())
      .then(data => {
        recordGeolocationEvent(data);
      })
      .catch(error => {
        console.error('Error fetching geolocation data:', error);
      });
  }, [recordGeolocationEvent]);

  return (
    <>
      <GlobalStyles />
      <Fp.Provider publicKey={publicKey} sandboxOutcome={sandboxOutcome}>
        <Stack direction="row" width="100%">
          <Stack direction="column" width="100%">
            <Header showLogs={showLogs} onShowLogs={handleShowLogs}>
              Onboarding
            </Header>
            <ContentLayout>
              <Stack direction="row" width="100%" gridArea="left">
                <Stepper
                  onChange={() => undefined}
                  value={{ option: steps[currentStep] }}
                  aria-label="Steps"
                  options={steps}
                />
              </Stack>
              <Stack direction="column" width="100%" maxWidth="480px" gridArea="center">
                <CurrentComponent onFormSubmit={handleSubmit} onInputEvent={recordInputEvent} />
              </Stack>
            </ContentLayout>
          </Stack>
          {showLogs && <Toaster />}
        </Stack>
      </Fp.Provider>
    </>
  );
};

export default Demo;
