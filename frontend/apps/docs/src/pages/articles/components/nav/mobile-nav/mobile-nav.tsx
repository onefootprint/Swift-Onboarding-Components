import { useState } from 'react';
import type { PageNavigation } from 'src/types/page';
import { useLockedBody } from 'usehooks-ts';

import { fromTopToTop } from '@onefootprint/ui';
import { AnimatePresence, motion } from 'framer-motion';
import AppNav from 'src/components/app-nav';
import NavigationFooter from 'src/components/navigation-footer';
import MobileHeader from '../../app-header/components/mobile-header';

type MobileNavProps = {
  navigation?: PageNavigation;
};

const MobileNav = ({ navigation }: MobileNavProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  useLockedBody(isExpanded);

  const handleToggleNav = () => {
    setIsExpanded(prevState => !prevState);
  };

  const handleNavItemClick = () => {
    setIsExpanded(false);
  };

  return (
    <div className="flex flex-col h-full md:hidden">
      <MobileHeader onClick={handleToggleNav} isExpanded={isExpanded} />
      <AnimatePresence>
        {isExpanded && navigation && (
          <motion.nav
            variants={fromTopToTop}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col flex-1 max-h-[calc(100vh-var(--header-height))]"
          >
            <AppNav navigation={navigation} onItemClick={handleNavItemClick} />
            <NavigationFooter />
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileNav;
