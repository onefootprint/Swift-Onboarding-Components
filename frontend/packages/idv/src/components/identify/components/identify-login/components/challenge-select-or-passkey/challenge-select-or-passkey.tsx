import type { ChallengeKind as Kind } from '@onefootprint/types';
import { AuthMethodKind } from '@onefootprint/types';
import type { ComponentProps, FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { isBiometric } from '../../../../../../utils';
import useGetHeaderText from '../../hooks/use-get-header-text';
import useTryAnotherWay from '../../hooks/use-try-another-way';
import { useIdentifyMachine } from '../../state';
import InlineAction from '../inline-action';
import Component from './component';
import useRunPasskey from './hooks/run-passkey';
import { getChallengeTitleByKind, getMethods, getSubTitle } from './utils';

type InnerComponentProps = ComponentProps<typeof Component>;
type ChallengeSelectOrPasskeyProps = Pick<InnerComponentProps, 'Header'>;

const ChallengeSelectOrPasskey = ({ Header }: ChallengeSelectOrPasskeyProps) => {
  const [state, send] = useIdentifyMachine();
  const { device, identify, variant, phoneNumber, email } = state.context;
  const { t } = useTranslation('identify');
  const tryAnotherWay = useTryAnotherWay(t);
  const headerTitle = useGetHeaderText();
  const headerSubtitle = getSubTitle(t, variant);
  const [selectedChallenge, setSelectedChallenge] = useState<Kind | undefined>(undefined);

  const runPasskey = useRunPasskey({
    onSuccess: ({ authToken }) => {
      send({
        type: 'challengeSucceeded',
        payload: { kind: AuthMethodKind.passkey, authToken },
      });
    },
  });

  const methodOptions = useMemo(() => {
    const ctx = { identify, phoneNumber, email };
    const titleMap = getChallengeTitleByKind(t, ctx);
    return getMethods(identify, device, titleMap);
  }, [t, identify, device, phoneNumber, email]);

  useEffect(() => {
    if (methodOptions.length && !selectedChallenge) {
      setSelectedChallenge(methodOptions[0].value);
    }
  }, [selectedChallenge, methodOptions]);

  const handleSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (!selectedChallenge) {
      return;
    }
    if (isBiometric(selectedChallenge)) {
      runPasskey.initiatePasskeyChallenge();
    } else {
      send({ type: 'goToChallenge', payload: selectedChallenge });
    }
  };

  return (
    <Component
      Header={Header}
      isCtaDisabled={!selectedChallenge}
      isLoading={runPasskey.isWaiting}
      methodOptions={methodOptions}
      methodSelected={selectedChallenge || ''}
      onMethodChange={value => setSelectedChallenge(value as Kind)}
      onSubmit={handleSubmit}
      texts={{
        headerTitle,
        headerSubtitle,
        cta: t('continue'),
      }}
    >
      {tryAnotherWay ? (
        <InlineAction label={tryAnotherWay.label} labelCta={tryAnotherWay.labelCta} onClick={tryAnotherWay.onClick} />
      ) : null}
    </Component>
  );
};

export default ChallengeSelectOrPasskey;
