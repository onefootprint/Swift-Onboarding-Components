import { IcoCheckCircle40, IcoWarning40 } from '@onefootprint/icons';
import { HeaderTitle, NavigationHeader } from '@onefootprint/idv';
import { Box } from '@onefootprint/ui';

type Variant = 'success' | 'error';
export type NotificationProps = {
  subtitle?: string;
  title: string;
  variant?: Variant;
  children?: React.ReactNode;
};

const VariantIcon = ({ variant }: { variant: Variant }): JSX.Element => (
  <Box display="flex" flexDirection="column" alignItems="center" textAlign="center" position="relative">
    {variant === 'success' ? <IcoCheckCircle40 color={variant} /> : <IcoWarning40 color={variant} />}
    <Box marginBottom={3} />
  </Box>
);

const Notification = ({ subtitle, title, variant, children }: NotificationProps): JSX.Element => (
  <>
    {variant ? <VariantIcon variant={variant} /> : null}
    <NavigationHeader leftButton={{ variant: 'close' }} />
    <HeaderTitle title={title} subtitle={subtitle} />
    {children}
  </>
);

export default Notification;
