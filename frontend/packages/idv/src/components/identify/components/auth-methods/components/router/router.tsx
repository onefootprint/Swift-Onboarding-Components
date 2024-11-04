import { AuthMethodKind } from '@onefootprint/types';
import type React from 'react';
import { useTranslation } from 'react-i18next';

import type { NavigationHeaderLeftButtonProps } from '@/idv/components/layout';
import StepHeader from '@/idv/components/step-header';
import { useDeviceInfo } from '@/idv/hooks';
import Liveness from '@/idv/plugins/liveness';
import { checkIsInIframe, getLogger, trackAction } from '@/idv/utils';
import { Identify, IdentifyVariant, UpdateEmail, UpdatePhone } from '../../../..';
import type { HeaderProps } from '../../../../types';
import type { AuthMethodsMachineContext as MachineContext } from '../../state';
import { useAuthMethodsMachine } from '../../state';
import { getHeaderLeftNavButton } from '../../utils';
import UserDashboard from '../dashboard';

type AuthMethodsRouterProps = {
  onDone: React.MouseEventHandler<HTMLButtonElement>;
};

const { logInfo, logTrack, logWarn } = getLogger({ location: 'auth-methods-router' });

const getHeader = (
  _ctx: MachineContext,
  leftButton: NavigationHeaderLeftButtonProps,
): ((props: HeaderProps) => JSX.Element) =>
  function Header({ title, subtitle, overrideLeftButton }): JSX.Element {
    return <StepHeader leftButton={overrideLeftButton || leftButton} subtitle={subtitle} title={title} />;
  };

const AuthMethodsRouter = ({ onDone }: AuthMethodsRouterProps): JSX.Element | null => {
  const [state, send] = useAuthMethodsMachine();
  const { context, matches } = state;
  const { t } = useTranslation('identify');
  const device = context.device;
  const isDone = matches('success');
  const Header = getHeader(context, getHeaderLeftNavButton(state, send));

  useDeviceInfo(
    payload => {
      logTrack(`Webauthn support:${payload.hasSupportForWebauthn}`, payload);
      send({ type: 'setDevice', payload });
    },
    () => logWarn('Unable to collect device info'),
  );

  if (isDone) return null;
  if (matches('identify') && device) {
    return (
      <Identify
        variant={IdentifyVariant.updateLoginMethods}
        device={device}
        initialAuthToken={context.authToken}
        onDone={({ authToken }) => {
          trackAction('update-auth-methods:identify-completed');
          logTrack('Identify completed');
          send({ type: 'setVerifyToken', payload: authToken });
        }}
        // Since we don't have a playbook for this flow, always treat it as live
        // TODO would be more correct to fetch whether the user defined by the auth token is
        // live or sandbox
        isLive
      />
    );
  }
  if (matches('dashboard')) {
    return <UserDashboard Header={Header} onDone={onDone} isEditing />;
  }
  if (matches('updateEmail') && context.verifyToken) {
    return (
      <UpdateEmail
        Header={Header}
        authToken={context.verifyToken}
        actionKind={context.updateMethod}
        identifyVariant={IdentifyVariant.updateLoginMethods}
        onSuccess={newEmail => {
          trackAction('update-auth-methods:update-completed', { kind: 'email' });
          logInfo('Email updated');
          send({
            type: 'updateUserDashboard',
            payload: {
              kind: AuthMethodKind.email,
              entry: { label: newEmail, status: 'set' },
            },
          });
        }}
      />
    );
  }
  if (matches('updatePhone') && context.verifyToken) {
    return (
      <UpdatePhone
        Header={Header}
        authToken={context.verifyToken}
        actionKind={context.updateMethod}
        identifyVariant={IdentifyVariant.updateLoginMethods}
        onSuccess={newPhoneNumber => {
          trackAction('update-auth-methods:update-completed', { kind: 'phone' });
          logInfo('Phone updated');
          send({
            type: 'updateUserDashboard',
            payload: {
              kind: AuthMethodKind.phone,
              entry: { label: newPhoneNumber, status: 'set' },
            },
          });
        }}
      />
    );
  }
  if (matches('updatePasskey') && device && context.verifyToken) {
    return (
      <>
        <Header />
        <Liveness
          actionKind={context.updateMethod}
          idvContext={{
            authToken: context.verifyToken,
            device: device,
            isInIframe: checkIsInIframe(),
          }}
          onDone={() => {
            trackAction('update-auth-methods:update-completed', { kind: 'passkey' });
            logInfo('Passkey updated');
            send({
              type: 'updateUserDashboard',
              payload: {
                kind: AuthMethodKind.passkey,
                entry: { label: t('passkey'), status: 'set' },
              },
            });
          }}
        />
      </>
    );
  }

  return null;
};

export default AuthMethodsRouter;
