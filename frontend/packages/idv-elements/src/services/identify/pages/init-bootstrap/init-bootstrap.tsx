import React from 'react';
import { useEffectOnce } from 'usehooks-ts';

import { useIdentify } from '../../api-hooks';
import InitShimmer from '../../components/init-shimmer';
import useIdentifierSuffix from '../../hooks/use-identifier-suffix';
import useIdentifyMachine from '../../hooks/use-identify-machine';
import validateBootstrapData from './utils/validate-bootstrap-data';

const InitBootstrap = () => {
  const [state, send] = useIdentifyMachine();
  const {
    bootstrapData,
    onboarding: { tenantPk },
  } = state.context;
  const identifyMutation = useIdentify();
  const idSuffix = useIdentifierSuffix();

  const identify = async (email?: string, phoneNumber?: string) => {
    // If both email and phone identified successfully, we will give preference to phone
    try {
      if (phoneNumber) {
        const identifier = { phoneNumber: idSuffix.append(phoneNumber) };
        const phoneIdentify = await identifyMutation.mutateAsync({
          identifier,
          tenantPk,
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
          tenantPk,
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
        type: 'bootstrapDataInvalid',
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
        type: 'identifyFailed',
        payload: {
          email,
          phoneNumber,
        },
      });

      return;
    }

    send({
      type: 'identified',
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
