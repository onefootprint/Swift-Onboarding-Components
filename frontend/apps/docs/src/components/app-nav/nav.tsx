import { IcoChevronRight16 } from '@onefootprint/icons';
import { cx } from 'class-variance-authority';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useState } from 'react';
import type { PageNavigation } from 'src/types/page';
import NavigationLink from '../navigation-link';

type AppNavProps = {
  navigation: PageNavigation;
  onItemClick?: () => void;
};

const AppNav = ({ navigation, onItemClick }: AppNavProps) => {
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const handleTitleClick = (title: string) => {
    setExpandedSections(prev => {
      const isExpanded = prev.includes(title);
      if (isExpanded) {
        return prev.filter(section => section !== title);
      }
      return [...prev, title];
    });
  };

  return (
    <>
      {navigation.map(({ name, items }) => (
        <div className="flex flex-col" key={name}>
          <div className="p-3 pointer-events-none text-label-3">
            <h3>{name}</h3>
          </div>
          <nav className="flex flex-col">
            {items.map(({ title, slug, items: subItems }) => {
              const hasSubItems = subItems && subItems.length > 0;
              const isSectionExpanded = expandedSections.includes(title);
              const isCurrentPath = router.asPath === slug;

              if (!hasSubItems) {
                return (
                  <NavigationLink
                    href={slug}
                    key={`nav-item-${title}-${slug}`}
                    isSelected={isCurrentPath}
                    onClick={onItemClick}
                  >
                    {title}
                  </NavigationLink>
                );
              }

              return (
                <div key={`section-${title}`} className="cursor-pointer">
                  <button
                    aria-selected={isSectionExpanded}
                    type="button"
                    onClick={() => handleTitleClick(title)}
                    className={cx(
                      'flex items-center text-body-3 justify-between w-full p-3 rounded hover:bg-secondary',
                      {
                        'text-primary': isSectionExpanded,
                        'text-tertiary': !isSectionExpanded,
                      },
                    )}
                  >
                    {title}
                    <motion.div
                      initial={false}
                      animate={{ rotate: isSectionExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <IcoChevronRight16 color={isSectionExpanded ? 'primary' : 'tertiary'} />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {isSectionExpanded && subItems && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        {subItems.map(item => (
                          <NavigationLink
                            href={item.slug}
                            key={`nav-subitem-${item.title}-${item.slug}`}
                            isSelected={router.asPath === item.slug}
                            onClick={onItemClick}
                            className="pl-6"
                          >
                            {item.title}
                          </NavigationLink>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>
        </div>
      ))}
    </>
  );
};

export default AppNav;
