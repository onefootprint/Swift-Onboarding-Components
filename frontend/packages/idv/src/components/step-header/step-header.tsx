import { Box } from '@onefootprint/ui';
import HeaderTitle from '../layout/components/header-title';
import NavigationHeader from '../layout/components/navigation-header';
import type { NavigationHeaderLeftButtonProps } from '../layout/components/navigation-header/types';
import Logo from '../logo';

type HeaderProps = {
  leftButton: NavigationHeaderLeftButtonProps;
  logoUrl?: string;
  orgName?: string;
  showLogo?: boolean;
  subtitle?: string | JSX.Element;
  title?: string | JSX.Element;
};

const StepHeader = ({ leftButton, logoUrl, orgName, showLogo, subtitle, title }: HeaderProps) => {
  const shouldShowLogo = showLogo && orgName;

  return (
    <>
      <NavigationHeader leftButton={leftButton} />
      {shouldShowLogo || title ? (
        <Box display="flex" flexDirection="column" gap={7}>
          {shouldShowLogo ? <Logo orgName={orgName} logoUrl={logoUrl} /> : null}
          {title ? <HeaderTitle title={title} subtitle={subtitle} /> : null}
        </Box>
      ) : null}
    </>
  );
};

export default StepHeader;
