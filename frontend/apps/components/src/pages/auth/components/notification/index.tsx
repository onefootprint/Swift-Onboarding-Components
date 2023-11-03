import { HeaderTitle, NavigationHeader } from '@onefootprint/idv-elements';
import React from 'react';

type NotificationProps = { title: string; subtitle: string | undefined };

const Notification = ({ title, subtitle }: NotificationProps): JSX.Element => (
  <>
    <NavigationHeader leftButton={{ variant: 'close' }} />
    <HeaderTitle title={title} subtitle={subtitle} />
  </>
);

export default Notification;
