import type { FormValues } from '@onefootprint/footprint-react';
import { Fp, InlineOtpNotSupported, InlineProcessError, useFootprint } from '@onefootprint/footprint-react';
import { Button, Divider, LoadingSpinner, Stepper } from '@onefootprint/ui';
import debounce from 'lodash/debounce';
import { useEffect, useState } from 'react';
import { Map as MapboxMap } from 'react-map-gl';

import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { uniqueId } from 'lodash';
import { useRouter } from 'next/router';
import { LoggingFpInput, LoggingFpPinInput } from './components/logging-fp-inputs';
import type { CustomInputEvent, GeolocationEvent } from './components/logging-fp-inputs';
import GlobalStyles from './kyc.styles';

const steps = [
  {
    label: 'Identify',
    value: 'identify',
  },
  {
    label: 'Personal data',
    value: 'personal-data',
  },
  {
    label: 'Address',
    value: 'address',
  },
  {
    label: 'SSN',
    value: 'ssn',
  },
  {
    label: 'Confirmation',
    value: 'confirmation',
  },
];

const LOCATION_API_URL = 'https://ipapi.co/json/';
const publicKey = process.env.NEXT_PUBLIC_KYC_KEY || 'pb_test_2i5Sl82d7NQOnToRYrD2dx';

const Demo = () => {
  const router = useRouter();
  const [option, setOption] = useState(steps[0]);
  const [events, setEvents] = useState<(CustomInputEvent | GeolocationEvent)[]>([]);
  const isIdentify = option.value === 'identify';
  const isPersonalData = option.value === 'personal-data';
  const isAddress = option.value === 'address';
  const isSsn = option.value === 'ssn';
  const isSuccess = option.value === 'confirmation';

  const handleBack = () => {
    const currentIndex = steps.findIndex(step => step.value === option.value);
    if (currentIndex > 0) {
      setOption(steps[currentIndex - 1]);
    }
  };

  useEffect(() => {
    if (!router.isReady) return;
    const fetchGeolocation = async () => {
      try {
        const response = await fetch(LOCATION_API_URL);
        const data = await response.json();
        const geolocationEvent: GeolocationEvent = {
          id: uniqueId(),
          type: 'geolocation',
          timestamp: new Date().toISOString(),
          value: `latitude: ${data.latitude}, longitude: ${data.longitude}`,
          city: data.city,
          country_name: data.country_name,
          latitude: data.latitude,
          longitude: data.longitude,
        };
        setEvents(prevEvents => [geolocationEvent, ...prevEvents]);
      } catch (error) {
        console.error('Error fetching geolocation:', error);
      }
    };
    fetchGeolocation();
  }, [router.isReady]);

  const handleEvent = debounce((event: CustomInputEvent | GeolocationEvent) => {
    setEvents(prevEvents => {
      return [event, ...prevEvents];
    });
  }, 20);

  return (
    <>
      <GlobalStyles />
      <Fp.Provider publicKey={publicKey}>
        <div className="flex items-center justify-center border-b border-solid text-label-1 border-tertiary h-11">
          Onboarding
        </div>
        <div className="relative gap-8 mt-7">
          <div className="absolute flex flex-col h-full top-12 left-12">
            <Stepper onChange={() => undefined} value={{ option }} aria-label="Steps" options={steps} />
          </div>
          <div
            className="flex flex-col gap-5 absolute top-0 right-12 bg-primary rounded py-8 px-5 overflow-y-auto overflow-x-hidden w-[400px] h-[calc(100vh-100px)] z-10 shadow-sm"
            style={{ maskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 80%)' }}
          >
            {events.map(event => {
              if (event.type === 'geolocation') {
                const { id, city, country_name, latitude, longitude, timestamp } = event as GeolocationEvent;
                return (
                  <motion.div
                    key={id}
                    className="flex flex-col gap-2"
                    initial={{ opacity: 0, x: 20, y: -5, height: 0 }}
                    animate={{ opacity: 1, x: 0, y: 0, height: 'auto' }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="h-[200px] w-full rounded overflow-hidden">
                      <MapboxMap
                        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                        mapStyle="mapbox://styles/mapbox/light-v10"
                        style={{ width: '100%', height: '100%' }}
                        initialViewState={{
                          latitude,
                          longitude,
                          zoom: 11,
                        }}
                        maxZoom={20}
                        minZoom={1}
                        attributionControl={false}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-snippet-3 text-secondary">
                        {format(new Date(timestamp), 'MM-dd, yyyy hh:mm:ss')}
                      </p>
                      <h5 className="text-snippet-3 text-secondary">
                        From: {city}, {country_name}
                      </h5>
                    </div>
                  </motion.div>
                );
              }
              return (
                <motion.div
                  key={event.id}
                  className="text-snippet-3 text-secondary"
                  initial={{ opacity: 0, x: 20, y: -5, height: 0 }}
                  animate={{ opacity: 1, x: 0, y: 0, height: 'auto' }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-snippet-2 text-secondary">{event.type}</div>
                  <div className="text-snippet-3 text-secondary">
                    {format(new Date(event.timestamp), 'MM-dd, yyyy hh:mm:ss')}
                  </div>
                  {event.value && <div className="text-snippet-3 text-secondary">{event.value}</div>}
                </motion.div>
              );
            })}
          </div>
          <div className="p-12">
            <div className="flex flex-col gap-5 max-w-[450px] mx-auto">
              {isIdentify && (
                <Identify
                  onDone={() => {
                    setOption(steps[1]);
                  }}
                  onEvent={handleEvent}
                />
              )}
              {isPersonalData && (
                <PersonalData
                  onDone={() => {
                    setOption(steps[2]);
                  }}
                  onEvent={handleEvent}
                />
              )}
              {isAddress && (
                <Address
                  onDone={() => {
                    setOption(steps[3]);
                  }}
                  onBack={handleBack}
                  onEvent={handleEvent}
                />
              )}
              {isSsn && (
                <Ssn
                  onDone={(validationToken: string) => {
                    console.log(validationToken);
                    setOption(steps[4]);
                  }}
                  onBack={handleBack}
                  onEvent={handleEvent}
                />
              )}
              {isSuccess && <Success />}
            </div>
          </div>
        </div>
      </Fp.Provider>
    </>
  );
};

const Identify = ({
  onDone,
  onEvent,
}: { onDone: () => void; onEvent: (event: CustomInputEvent | GeolocationEvent) => void }) => {
  const fp = useFootprint();
  const [showOtp, setShowOtp] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubmitData = async (formValues: FormValues) => {
    const email = formValues['id.email'];
    const phoneNumber = formValues['id.phone_number'];
    if (!email || !phoneNumber) return null;

    setIsPending(true);
    try {
      await fp.createEmailPhoneBasedChallenge({ email, phoneNumber });
      setShowOtp(true);
    } catch (e) {
      if (e instanceof InlineOtpNotSupported) {
        await fp.launchIdentify(
          { email, phoneNumber },
          {
            onAuthenticated() {
              onDone();
            },
          },
        );
      }
    } finally {
      setIsPending(false);
    }
  };

  const handleSubmitPin = async (verificationCode: string) => {
    setIsPending(true);
    try {
      const response = await fp.verify({ verificationCode });
      console.log(response);
      onDone();
    } catch (error) {
      console.error('Error verifying pin:', error);
      // Handle the error appropriately
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      {showOtp ? (
        <div className="flex flex-col items-center text-center">
          <div className="mb-7">
            <p className="text-heading-3">Verify your phone number</p>
            <p className="text-body-3 text-secondary">Enter the 6-digit code sent to your phone</p>
          </div>
          <LoggingFpPinInput
            onEvent={onEvent}
            onComplete={handleSubmitPin}
            autoFocus
            pinActiveClassName="fp-input-active"
          />
          {isPending && (
            <div className="mt-6">
              <LoadingSpinner />
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="mb-7">
            <p className="text-heading-3">Identification</p>
            <p className="text-body-3 text-secondary">Please provide your email and phone number</p>
          </div>
          <Fp.Form onSubmit={handleSubmitData}>
            <div className="flex flex-col gap-5">
              <Fp.Field name="id.email">
                <Fp.Label>Your email</Fp.Label>
                <LoggingFpInput onEvent={onEvent} placeholder="jane@acme.com" />
                <Fp.FieldErrors />
              </Fp.Field>
              <Fp.Field name="id.phone_number">
                <Fp.Label>Phone</Fp.Label>
                <LoggingFpInput onEvent={onEvent} placeholder="(123) 456-7890" />
                <Fp.FieldErrors />
              </Fp.Field>
              <Divider marginBlock={3} />
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Loading...' : 'Continue'}
              </Button>
            </div>
          </Fp.Form>
        </>
      )}
    </>
  );
};

const PersonalData = ({
  onDone,
  onEvent,
}: { onDone: () => void; onEvent: (event: CustomInputEvent | GeolocationEvent) => void }) => {
  const fp = useFootprint();
  const { vaultData } = fp;
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (formValues: FormValues) => {
    setIsPending(true);
    try {
      await fp.vault(formValues);
      onDone();
    } catch (error) {
      console.error('Error vaulting personal data:', error);
      // Handle the error appropriately
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <div className="mb-7">
        <p className="text-heading-3">Personal information</p>
        <p className="text-body-3 text-secondary">Please provide your personal details</p>
      </div>
      <Fp.Form
        onSubmit={handleSubmit}
        defaultValues={{
          'id.first_name': vaultData?.['id.first_name'],
          'id.middle_name': vaultData?.['id.middle_name'],
          'id.last_name': vaultData?.['id.last_name'],
          'id.dob': vaultData?.['id.dob'],
        }}
      >
        <div className="flex flex-col gap-5">
          <Fp.Field name="id.first_name">
            <Fp.Label>First name</Fp.Label>
            <LoggingFpInput onEvent={onEvent} placeholder="Jane" />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="id.middle_name">
            <Fp.Label>Middle name</Fp.Label>
            <LoggingFpInput onEvent={onEvent} placeholder="Sue" />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="id.last_name">
            <Fp.Label>Last name</Fp.Label>
            <LoggingFpInput onEvent={onEvent} placeholder="Joe" />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="id.dob">
            <Fp.Label>DOB</Fp.Label>
            <LoggingFpInput onEvent={onEvent} placeholder="MM/DD/YYYY" />
            <Fp.FieldErrors />
          </Fp.Field>
          <Divider marginBlock={3} />
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Loading...' : 'Continue'}
          </Button>
        </div>
      </Fp.Form>
    </>
  );
};

const Address = ({
  onDone,
  onBack,
  onEvent,
}: { onDone: () => void; onBack: () => void; onEvent: (event: CustomInputEvent | GeolocationEvent) => void }) => {
  const fp = useFootprint();
  const { vaultData } = fp;
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (formValues: FormValues) => {
    setIsPending(true);
    try {
      await fp.vault(formValues);
      onDone();
    } catch (error) {
      console.error('Error vaulting address data:', error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <div className="mb-7">
        <p className="text-heading-3">Address information</p>
        <p className="text-body-3 text-secondary">Please provide your address details</p>
      </div>
      <Fp.Form
        onSubmit={handleSubmit}
        defaultValues={{
          'id.country': vaultData?.['id.country'] || 'US',
          'id.address_line1': vaultData?.['id.address_line1'],
          'id.address_line2': vaultData?.['id.address_line2'],
          'id.city': vaultData?.['id.city'],
          'id.state': vaultData?.['id.state'],
          'id.zip': vaultData?.['id.zip'],
        }}
      >
        <div className="flex flex-col gap-5">
          <Fp.Field name="id.country">
            <LoggingFpInput onEvent={onEvent} placeholder="US" defaultValue="US" type="hidden" />
          </Fp.Field>
          <Fp.Field name="id.address_line1">
            <Fp.Label>Address line 1</Fp.Label>
            <LoggingFpInput onEvent={onEvent} placeholder="Street number" autoFocus />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="id.address_line2">
            <Fp.Label>Address line 2 (optional)</Fp.Label>
            <LoggingFpInput onEvent={onEvent} placeholder="Apartment, suite, etc." />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="id.city">
            <Fp.Label>City</Fp.Label>
            <LoggingFpInput onEvent={onEvent} placeholder="New York" />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="id.state">
            <Fp.Label>State</Fp.Label>
            <LoggingFpInput onEvent={onEvent} placeholder="NY" />
            <Fp.FieldErrors />
          </Fp.Field>
          <Fp.Field name="id.zip">
            <Fp.Label>Zip</Fp.Label>
            <LoggingFpInput onEvent={onEvent} placeholder="11206" />
            <Fp.FieldErrors />
          </Fp.Field>
          <Divider marginBlock={3} />
          <div className="flex flex-row gap-3">
            <Button onClick={onBack} variant="secondary" fullWidth>
              Back
            </Button>
            <Button type="submit" disabled={isPending} fullWidth>
              {isPending ? 'Loading...' : 'Continue'}
            </Button>
          </div>
        </div>
      </Fp.Form>
    </>
  );
};

const Ssn = ({
  onDone,
  onBack,
  onEvent,
}: {
  onDone: (validationToken: string) => void;
  onBack: () => void;
  onEvent: (event: CustomInputEvent | GeolocationEvent) => void;
}) => {
  const fp = useFootprint();
  const { vaultData } = fp;
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (formValues: FormValues) => {
    setIsPending(true);
    try {
      await fp.vault(formValues);
      const { validationToken } = await fp.process();
      onDone(validationToken);
    } catch (e) {
      if (e instanceof InlineProcessError) {
        fp.handoff({ onComplete: onDone });
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <div className="mb-7">
        <p className="text-heading-3">Social Security Number</p>
        <p className="text-body-3 text-secondary">Please provide your SSN</p>
      </div>
      <Fp.Form
        onSubmit={handleSubmit}
        defaultValues={{
          'id.ssn9': vaultData?.['id.ssn9'],
        }}
      >
        <div className="flex flex-col gap-5">
          <Fp.Field name="id.ssn9">
            <Fp.Label>SSN</Fp.Label>
            <LoggingFpInput onEvent={onEvent} placeholder="XXX-XX-XXXX" autoFocus />
            <Fp.FieldErrors />
          </Fp.Field>
          <Divider marginBlock={3} />
          <div className="flex flex-row gap-3">
            <Button onClick={onBack} variant="secondary" fullWidth>
              Back
            </Button>
            <Button type="submit" disabled={isPending} fullWidth>
              {isPending ? 'Loading...' : 'Continue'}
            </Button>
          </div>
        </div>
      </Fp.Form>
    </>
  );
};

const Success = () => (
  <>
    <div className="mb-7">
      <p className="text-heading-3">Success</p>
      <p className="text-body-3 text-secondary">You are all set!</p>
    </div>
  </>
);

export default Demo;
