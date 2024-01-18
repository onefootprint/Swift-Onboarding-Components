import { IcoCheckCircle40, IcoWarning40 } from '@onefootprint/icons';
import { HeaderTitle, NavigationHeader } from '@onefootprint/idv';
import styled from '@onefootprint/styled';
import { Box } from '@onefootprint/ui';
import React from 'react';

type Variant = 'success' | 'error';
export type NotificationProps = {
  subtitle?: string;
  title: string;
  variant?: Variant;
};

const VariantIcon = ({ variant }: { variant: Variant }): JSX.Element => (
  <VariantWrapper>
    {variant === 'success' ? (
      <IcoCheckCircle40 color={variant} />
    ) : (
      <IcoWarning40 color={variant} />
    )}
    <Box marginBottom={3} />
  </VariantWrapper>
);

const Notification = ({
  subtitle,
  title,
  variant,
}: NotificationProps): JSX.Element => (
  <>
    {variant ? <VariantIcon variant={variant} /> : null}
    <NavigationHeader leftButton={{ variant: 'close' }} />
    <HeaderTitle title={title} subtitle={subtitle} />
  </>
);

export default Notification;

const VariantWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  text-align: center;
  position: relative;
`;
