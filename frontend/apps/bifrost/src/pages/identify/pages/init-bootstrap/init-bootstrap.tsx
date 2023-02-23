import { useIdentify } from '@onefootprint/footprint-elements';
import React from 'react';
import InitShimmer from 'src/components/init-shimmer';
import validateBootstrapData from 'src/pages/identify/utils/validate-bootstrap-data';
import { useEffectOnce } from 'usehooks-ts';

import useIdentifierSuffix from '../../hooks/use-identifier-suffix';
import useIdentifyMachine, { Events } from '../../hooks/use-identify-machine';

const InitBootstrap = () => {
  const [state, send] = useIdentifyMachine();
  const { bootstrapData } = state.context;
  const identifyMutation = useIdentify();
  const idSuffix = useIdentifierSuffix();

  const identify = async (email?: string, phoneNumber?: string) => {
    // If both email and phone identified successfully, we will give preference to phone
    try {
      if (phoneNumber) {
        const identifier = { phoneNumber: idSuffix.append(phoneNumber) };
        const phoneIdentify = await identifyMutation.mutateAsync({
          identifier,
        });

        if (phoneIdentify.userFound) {
          return {
            userFound: true,
            successfulIdentifier: identifier,
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
        const identifier = { email: idSuffix.append(email) };
        const emailIdentify = await identifyMutation.mutateAsync({
          identifier,
        });

        if (emailIdentify.userFound) {
          return {
            userFound: true,
            successfulIdentifier: identifier,
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
