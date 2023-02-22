import { useIdentify } from '@onefootprint/footprint-elements';
import { ChallengeKind, Identifier } from '@onefootprint/types';
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
    let emailIdentify;
    let phoneIdentify;

    try {
      if (email) {
        emailIdentify = await identifyMutation.mutateAsync({
          identifier: { email },
        });
      }
      if (phoneNumber) {
        phoneIdentify = await identifyMutation.mutateAsync({
          identifier: { phoneNumber },
        });
      }
    } catch (e) {
      console.error(e);
    }

    //
    // If both email and phone identified successfully, we will give preference to phone
    let successfulIdentifier: Identifier | undefined;
    let hasSyncablePassKey = false;
    let availableChallengeKinds: ChallengeKind[] | undefined = [];
    if (emailIdentify?.userFound && email) {
      successfulIdentifier = { email };
      hasSyncablePassKey = !!emailIdentify.hasSyncablePassKey;
      availableChallengeKinds = emailIdentify.availableChallengeKinds;
    }
    if (phoneIdentify?.userFound && phoneNumber) {
      successfulIdentifier = { phoneNumber };
      hasSyncablePassKey = !!phoneIdentify.hasSyncablePassKey;
      availableChallengeKinds = phoneIdentify.availableChallengeKinds;
    }

    return {
      successfulIdentifier,
      userFound: !!emailIdentify?.userFound || !!phoneIdentify?.userFound,
      availableChallengeKinds,
      hasSyncablePassKey,
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
