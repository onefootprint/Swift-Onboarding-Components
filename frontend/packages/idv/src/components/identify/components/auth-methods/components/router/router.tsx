import { AuthMethodKind } from '@onefootprint/types';
import type React from 'react';
import { useTranslation } from 'react-i18next';

import { Identify, IdentifyVariant, UpdateEmail, UpdatePhone } from '../../../..';
import { useDeviceInfo } from '../../../../../../hooks';
import Liveness from '../../../../../../plugins/liveness';
import { getLogger } from '../../../../../../utils';
import checkIsIframe from '../../../../../../utils/check-is-in-iframe';
import type { NavigationHeaderLeftButtonProps } from '../../../../../layout';
import StepHeader from '../../../../../step-header';
import type { HeaderProps } from '../../../../types';
import Notification from '../../../notification';
import type { AuthMethodsMachineContext as MachineContext } from '../../state';
import { useAuthMethodsMachine } from '../../state';
import { getHeaderLeftNavButton } from '../../utils';
import UserDashboard from '../dashboard';

type AuthMethodsRouterProps = {
  onDone: React.MouseEventHandler<HTMLButtonElement>;
};

const { logWarn } = getLogger({ location: 'auth-methods-router' });

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
    payload => send({ type: 'setDevice', payload }),
    () => logWarn('Unable to collect device info'),
  );

  if (isDone) return null;
  if (matches('identify') && device) {
    return (
      <Identify
        variant={IdentifyVariant.updateLoginMethods}
        device={device}
        initialAuthToken={context.authToken}
        onDone={({ authToken }) => send({ type: 'setVerifyToken', payload: authToken })}
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
            isInIframe: checkIsIframe(),
          }}
          onDone={() => {
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
  if (matches('notFoundChallenge')) {
    return (
      <Notification title={t('notification.404-token-title')} subtitle={t('notification.404-token-description')} />
    );
  }

  return null;
};

export default AuthMethodsRouter;
