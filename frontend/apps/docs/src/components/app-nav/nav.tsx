import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import NavigationLink from 'src/components/navigation-link';
import NavigationSectionTitle from 'src/components/navigation-section-title';
import NavigationSubcategory from 'src/components/navigation-subcategory';
import type { PageNavigation } from 'src/types/page';

type AppNavProps = {
  navigation: PageNavigation;
  onItemClick?: () => void;
};

const AppNav = ({ navigation, onItemClick }: AppNavProps) => {
  const router = useRouter();

  return navigation.map(({ name, items }) => (
    <React.Fragment key={name}>
      <NavigationSectionTitle>{name}</NavigationSectionTitle>
      <nav>
        {items.map(({ title, slug, items: subItems }) => {
          const hasSubItems = subItems && subItems.length > 0;

          return hasSubItems ? (
            <NavigationSubcategory items={subItems} key={`nav-subcategory-${title}-${slug}`} title={title} />
          ) : (
            <NavigationLink
              $isSelected={router.asPath === slug}
              as={Link}
              href={slug}
              key={`nav-item-${title}-${slug}`}
              onClick={onItemClick}
            >
              {title}
            </NavigationLink>
          );
        })}
      </nav>
    </React.Fragment>
  ));
};

export default AppNav;
