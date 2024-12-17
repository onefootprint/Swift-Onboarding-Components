import StepHeader from '../../step-header';
import type { LogoConfig } from '../components/identify-login/state/types';
import type { HeaderProps } from '../components/identify-login/types';

const getHeader = (logoConfig?: LogoConfig, onPrev?: () => void): ((props: HeaderProps) => JSX.Element) => {
  const CLOSE = { variant: 'close' } as const;
  const BACK = { variant: 'back', onBack: onPrev } as const;
  const leftButton = onPrev ? BACK : CLOSE;

  const Header = ({ title, subtitle, overrideLeftButton }: HeaderProps): JSX.Element => {
    return (
      <StepHeader
        leftButton={overrideLeftButton || leftButton}
        logoUrl={logoConfig?.logoUrl}
        orgName={logoConfig?.orgName}
        showLogo={!!logoConfig}
        subtitle={subtitle}
        title={title}
      />
    );
  };
  return Header;
};

export default getHeader;
