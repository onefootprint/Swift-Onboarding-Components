import React from 'react';

import { HeaderTitle, NavigationHeader } from '../../../layout';

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
