import { HeaderTitle, NavigationHeader } from '@onefootprint/idv';
import React from 'react';

export type NotificationProps = {
  subtitle?: string;
  title: string;
};

const Notification = ({ subtitle, title }: NotificationProps): JSX.Element => (
  <>
    <NavigationHeader leftButton={{ variant: 'close' }} />
    <HeaderTitle title={title} subtitle={subtitle} />
  </>
);

export default Notification;
