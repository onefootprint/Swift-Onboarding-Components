import { HeaderTitle, NavigationHeader } from '@onefootprint/idv-elements';
import React from 'react';

export type NotificationProps = { title: string; subtitle?: string };

const Notification = ({ title, subtitle }: NotificationProps): JSX.Element => (
  <>
    <NavigationHeader leftButton={{ variant: 'close' }} />
    <HeaderTitle title={title} subtitle={subtitle} />
  </>
);

export default Notification;
