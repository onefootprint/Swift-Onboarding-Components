import { DASHBOARD_BASE_URL } from '@onefootprint/global-constants';
import { Slot } from '@radix-ui/react-slot';
import { useEffect, useState } from 'react';
import { LINTRK_CONVERSION_ID } from 'src/config/constants';
import { addCurrentParamsToUrl } from 'src/utils/dom';

type MarketingLinkProps = {
  app?: 'dashboard';
  asChild?: boolean;
  children: React.ReactNode;
  href: string;
  target?: string;
};

const MarketingLink = ({ app, asChild, children, href, target = 'blank' }: MarketingLinkProps) => {
  const Comp = asChild ? Slot : 'a';
  const baseHref = app === 'dashboard' ? `${DASHBOARD_BASE_URL}/${href}` : href;
  const [hydratedHref, setHydratedHref] = useState(baseHref);

  useEffect(() => {
    // Update the href on the client after hydration
    setHydratedHref(addCurrentParamsToUrl(baseHref));
  }, [baseHref]);

  const handleLoginClick = () => {
    window.lintrk('track', { conversion_id: LINTRK_CONVERSION_ID });
  };

  return (
    <Comp href={hydratedHref} target={target} onClick={handleLoginClick}>
      {children}
    </Comp>
  );
};

export default MarketingLink;
