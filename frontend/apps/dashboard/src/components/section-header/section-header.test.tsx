import { customRender, screen } from '@onefootprint/test-utils';

import type { SectionHeaderProps } from './section-header';
import SectionHeader from './section-header';

describe('<SectionHeader />', () => {
  const renderSectionHeader = ({
    children = 'children',
    subtitle = 'subtitle',
    title = 'title',
  }: Partial<SectionHeaderProps>) => {
    customRender(
      <SectionHeader subtitle={subtitle} title={title}>
        {children}
      </SectionHeader>,
    );
  };

  it('should render the title', () => {
    renderSectionHeader({ title: 'Team & Roles' });

    expect(screen.getByText('Team & Roles')).toBeInTheDocument();
  });

  it('should render the subtitle', () => {
    renderSectionHeader({
      subtitle: 'Manage who is a member of your team and their roles',
    });

    expect(screen.getByText('Manage who is a member of your team and their roles')).toBeInTheDocument();
  });

  it('should render the children', () => {
    renderSectionHeader({ children: 'children' });

    expect(screen.getByText('children')).toBeInTheDocument();
  });
});
