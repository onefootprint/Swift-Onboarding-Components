import { useIdentify } from '@onefootprint/footprint-elements';
import React from 'react';
import InitShimmer from 'src/components/init-shimmer';
import validateBootstrapData from 'src/pages/identify/utils/validate-bootstrap-data';
import { useEffectOnce } from 'usehooks-ts';

import useIdentifyMachine, { Events } from '../../hooks/use-identify-machine';

const InitBootstrap = () => {
  const [state, send] = useIdentifyMachine();
  const { bootstrapData } = state.context;
  const identifyMutation = useIdentify();

  const identify = async (email?: string, phoneNumber?: string) => {
    // If both email and phone identified successfully, we will give preference to phone
    try {
      if (phoneNumber) {
        const phoneIdentify = await identifyMutation.mutateAsync({
          identifier: { phoneNumber },
        });

        if (phoneIdentify.userFound) {
          return {
            userFound: true,
            successfulIdentifier: { phoneNumber },
            hasSyncablePassKey: !!phoneIdentify.hasSyncablePassKey,
            availableChallengeKinds: phoneIdentify.availableChallengeKinds,
          };
        }
      }
    } catch (e) {
      console.error(e);
    }

    try {
      if (email) {
        const emailIdentify = await identifyMutation.mutateAsync({
          identifier: { email },
        });

        if (emailIdentify.userFound) {
          return {
            userFound: true,
            successfulIdentifier: { email },
            hasSyncablePassKey: !!emailIdentify.hasSyncablePassKey,
            availableChallengeKinds: emailIdentify.availableChallengeKinds,
          };
        }
      }
    } catch (e) {
      console.error(e);
    }

    return {
      email,
      phoneNumber,
      userFound: false,
    };
  };

  const processBootstrapData = async () => {
    const { email, phoneNumber } = validateBootstrapData(bootstrapData);
    if (!email && !phoneNumber) {
      // If we don't have a valid email or phone number, ignore the bootstrap
      // data and take the user through the normal identify flow
      send({
        type: Events.bootstrapDataInvalid,
      });

      return;
    }

    const {
      successfulIdentifier,
      userFound,
      availableChallengeKinds,
      hasSyncablePassKey,
    } = await identify(email, phoneNumber);

    // If all identify calls failed, we need to re-collect email/phone data
    // (perhaps the data was invalid?) so don't pre-fill the form fields
    if (!successfulIdentifier) {
      send({
        type: Events.bootstrapDataInvalid,
      });

      return;
    }

    if (!userFound || !availableChallengeKinds?.length) {
      // If the user is not found, take them through the normal identify flow but
      // prefill the form fields
      send({
        type: Events.identifyFailed,
        payload: {
          email,
          phoneNumber,
        },
      });

      return;
    }

    send({
      type: Events.identified,
      payload: {
        email,
        phoneNumber,
        userFound,
        successfulIdentifier,
        availableChallengeKinds,
        hasSyncablePassKey,
      },
    });
  };

  useEffectOnce(() => {
    processBootstrapData();
  });

  return <InitShimmer />;
};

export default InitBootstrap;
