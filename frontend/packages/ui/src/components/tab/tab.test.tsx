import IcoCode16 from 'icons/ico/ico-code-16';
import React from 'react';
import { customRender, screen, userEvent } from 'test-utils';

import themes from '../../config/themes';
import TabItem from './tab-item';
import TabList, { TabListProps } from './tab-list';

Object.defineProperty(window, 'location', {
  value: {
    pathname: '/terminals',
    assign: jest.fn(),
  },
});

const defaultChildren = (
  <>
    <TabItem href="/lorem" selected iconComponent={IcoCode16}>
      Users
    </TabItem>
    <TabItem href="/ipsum" iconComponent={IcoCode16}>
      Security logs
    </TabItem>
  </>
);

describe('<Tab />', () => {
  const renderTab = ({
    children = defaultChildren,
    testID,
  }: Partial<TabListProps>) =>
    customRender(<TabList testID={testID}>{children}</TabList>);

  describe('<Tab />', () => {
    it('should assign a testID', () => {
      renderTab({
        testID: 'tab-test-id',
      });
      expect(screen.getByTestId('tab-test-id')).toBeInTheDocument();
    });

    it('should render the tab items', () => {
      renderTab({
        children: (
          <>
            <TabItem href="/lorem" selected iconComponent={IcoCode16}>
              Users
            </TabItem>
            <TabItem href="/ipsum" iconComponent={IcoCode16}>
              Settings
            </TabItem>
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
              <TabItem href="/lorem" selected iconComponent={IcoCode16}>
                Users
              </TabItem>
              <TabItem href="/ipsum" iconComponent={IcoCode16}>
                Security logs
              </TabItem>
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
          children: (
            <TabItem iconComponent={IcoCode16} onClick={onClickMockFn}>
              Users
            </TabItem>
          ),
        });
        const firstTab = screen.getByRole('tab', { name: 'Users' });
        await userEvent.click(firstTab);
        expect(onClickMockFn).toHaveBeenCalled();
      });
    });
  });
});
