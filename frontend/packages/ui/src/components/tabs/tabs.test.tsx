import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import themes from '@onefootprint/themes';
import React from 'react';

import TabItem from './tab';
import TabList, { TabListProps } from './tabs';

Object.defineProperty(window, 'location', {
  value: {
    pathname: '/terminals',
    assign: jest.fn(),
  },
});

const defaultChildren = (
  <>
    <TabItem href="/lorem" selected>
      Users
    </TabItem>
    <TabItem href="/ipsum">Security logs</TabItem>
  </>
);

describe('<Tabs />', () => {
  const renderTab = ({ children = defaultChildren }: Partial<TabListProps>) =>
    customRender(<TabList variant="pill">{children}</TabList>);

  it('should render the tab items', () => {
    renderTab({
      children: (
        <>
          <TabItem href="/lorem" selected>
            Users
          </TabItem>
          <TabItem href="/ipsum">Settings</TabItem>
        </>
      ),
    });
    expect(screen.getByRole('tab', { name: 'Users' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Settings' })).toBeInTheDocument();
  });

  describe('when a tab item is selected', () => {
    it('should have a different style in order to highlight it', () => {
      renderTab({
        children: (
          <>
            <TabItem href="/lorem" selected>
              Users
            </TabItem>
            <TabItem href="/ipsum">Security logs</TabItem>
          </>
        ),
      });
      const selectedTab = screen.getByRole('tab', { name: 'Users' });
      expect(selectedTab).toHaveStyle({
        backgroundColor: themes.light.backgroundColor.accent,
      });
    });
  });

  describe('when clicking on the tab', () => {
    it('should trigger  onClick event', async () => {
      const onClickMockFn = jest.fn();
      renderTab({
        children: <TabItem onClick={onClickMockFn}>Users</TabItem>,
      });
      const firstTab = screen.getByRole('tab', { name: 'Users' });
      await userEvent.click(firstTab);
      expect(onClickMockFn).toHaveBeenCalled();
    });
  });
});
