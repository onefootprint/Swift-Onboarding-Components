import AppNav from 'src/components/app-nav';
import NavigationFooter from 'src/components/navigation-footer';
import type { PageNavigation } from 'src/types/page';

type DesktopNavProps = {
  navigation: PageNavigation;
};

const DesktopNav = ({ navigation }: DesktopNavProps) => (
  <aside className="hidden md:flex flex-col fixed top-[var(--header-height)] left-0 w-[var(--page-aside-nav-width)] h-[calc(100vh-var(--header-height))] bg-primary border-solid border-r border-tertiary justify-between z-1 isolate">
    <div className="flex flex-col px-2 overflow-auto py-7 gap-7 scrollbar-none">
      <AppNav navigation={navigation} />
    </div>
    <NavigationFooter />
  </aside>
);

export default DesktopNav;
