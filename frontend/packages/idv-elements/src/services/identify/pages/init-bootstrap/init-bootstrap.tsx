import { getErrorMessage } from '@onefootprint/request';
import type { Identifier } from '@onefootprint/types';
import React from 'react';
import { useEffectOnce } from 'usehooks-ts';

import InitShimmer from '../../../../components/init-shimmer';
import useIdentify from '../../../../hooks/api/hosted/identify/use-identify';
import Logger from '../../../../utils/logger';
import useIdentifyMachine from '../../hooks/use-identify-machine';
import validateBootstrapData from './utils/validate-bootstrap-data';

const InitBootstrap = () => {
  const [state, send] = useIdentifyMachine();
  const {
    bootstrapData,
    obConfigAuth,
    identify: { sandboxId },
  } = state.context;
  const identifyMutation = useIdentify();

  const tryIdentifier = async (identifier: Identifier) => {
    const authTokenIdentify = await identifyMutation
      .mutateAsync({
        obConfigAuth,
        sandboxId,
        identifier,
      })
      .catch((error: unknown) => {
        Logger.error(
          `Identifying user by auth token failed in in identify ${getErrorMessage(
            error,
          )}`,
          'identify-init-bootstrap',
        );
      });

    if (authTokenIdentify?.userFound) {
      return {
        successfulIdentifier: identifier,
        hasSyncablePassKey: !!authTokenIdentify.hasSyncablePassKey,
        availableChallengeKinds: authTokenIdentify.availableChallengeKinds,
      };
    }

    return undefined;
  };

  const identify = async (email?: string, phoneNumber?: string) => {
    if (phoneNumber) {
      const result = await tryIdentifier({ phoneNumber });
      if (result) {
        return result;
      }
    }
    if (email) {
      const result = await tryIdentifier({ email });
      if (result) {
        return result;
      }
    }
    return undefined;
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

    const identifyResult = await identify(email, phoneNumber);
    if (!identifyResult || !identifyResult.availableChallengeKinds?.length) {
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

    const {
      successfulIdentifier,
      availableChallengeKinds,
      hasSyncablePassKey,
    } = identifyResult;

    send({
      type: 'identified',
      payload: {
        userFound: true,
        email,
        phoneNumber,
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
