import { Fp } from '@onefootprint/footprint-react';
import { Grid, Stack, Stepper } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

import ContentLayout from './components/content-layout';
import Header from './components/header';
import LogsContainer from './components/logs-container';
import GlobalStyles from './kyc.styles';
import { EventLog, NativeEvent } from './kyc.types';
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

const Demo = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showLogs, setShowLogs] = useState(false);
  const [eventLog, setEventLog] = useState<EventLog[]>([]);
  const router = useRouter();
  const { ob_key: obKey } = router.query;
  const publicKey = typeof obKey === 'string' ? obKey : publicKeyEnv;

  const handleShowLogs = () => {
    setShowLogs(!showLogs);
  };

  const recordEvent = (e: NativeEvent) => {
    const { type, target, nativeEvent } = e;
    const { value, name } = target as HTMLInputElement;
    const createdAt = new Date();
    const isAutoCompleted = !(nativeEvent instanceof InputEvent);
    const isPaste = nativeEvent instanceof ClipboardEvent;
    setEventLog(prevLog => [...prevLog, { type, value, name, createdAt, isAutoCompleted, isPaste }]);
  };

  const CurrentComponent = steps[currentStep].component;

  const handleSubmit = () => {
    setCurrentStep(prevStep => prevStep + 1);
  };

  return (
    <>
      <GlobalStyles />
      <Fp.Provider publicKey={publicKey}>
        <Stack direction="row" width="100%">
          <Stack direction="column" width="100%">
            <Header showLogs={showLogs} onShowLogs={handleShowLogs}>
              Onboarding
            </Header>
            <ContentLayout>
              <Grid.Item gridArea="stepper">
                <Stepper
                  onChange={() => undefined}
                  value={{ option: steps[currentStep] }}
                  aria-label="Steps"
                  options={steps}
                />
              </Grid.Item>
              <Grid.Item gridArea="form" direction="column" maxWidth="480px" width="100%">
                <CurrentComponent onFormSubmit={handleSubmit} onInputEvent={recordEvent} />
              </Grid.Item>
            </ContentLayout>
          </Stack>
          {showLogs && (
            <Grid.Item gridArea="transparentMode">
              <LogsContainer eventLog={eventLog} />
            </Grid.Item>
          )}
        </Stack>
      </Fp.Provider>
    </>
  );
};

export default Demo;
