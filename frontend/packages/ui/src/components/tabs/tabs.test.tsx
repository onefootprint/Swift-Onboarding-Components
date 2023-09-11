import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import React from 'react';

import Tab from './components/tab';
import type { TabsProps } from './tabs';
import Tabs from './tabs';

Object.defineProperty(window, 'location', {
  value: {
    pathname: '/terminals',
    assign: jest.fn(),
  },
});

const defaultChildren = (
  <>
    <Tab href="/lorem" selected>
      Users
    </Tab>
    <Tab href="/ipsum">Security logs</Tab>
  </>
);

describe('<Tabs />', () => {
  const renderTab = ({ children = defaultChildren }: Partial<TabsProps>) =>
    customRender(<Tabs variant="pill">{children}</Tabs>);

  it('should render the tab items', () => {
    renderTab({
      children: (
        <>
          <Tab href="/lorem" selected>
            Users
          </Tab>
          <Tab href="/ipsum">Settings</Tab>
        </>
      ),
    });
    expect(screen.getByRole('tab', { name: 'Users' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Settings' })).toBeInTheDocument();
  });

  describe('when a tab item is selected', () => {
    it('should have a `data-selected` attribute', () => {
      renderTab({
        children: (
          <>
            <Tab href="/lorem" selected>
              Users
            </Tab>
            <Tab href="/ipsum">Security logs</Tab>
          </>
        ),
      });
      const selectedTab = screen.getByRole('tab', { name: 'Users' });
      expect(selectedTab.getAttribute('data-selected')).toEqual('true');
    });
  });

  describe('when clicking on the tab', () => {
    it('should trigger  onClick event', async () => {
      const onClickMockFn = jest.fn();
      renderTab({
        children: <Tab onClick={onClickMockFn}>Users</Tab>,
      });
      const firstTab = screen.getByRole('tab', { name: 'Users' });
      await userEvent.click(firstTab);
      expect(onClickMockFn).toHaveBeenCalled();
    });
  });
});
