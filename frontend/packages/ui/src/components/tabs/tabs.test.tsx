import '../../config/initializers/i18next-test';

import { customRender, screen, userEvent } from '@onefootprint/test-utils';

import type { TabsProps } from './tabs';
import Tabs from './tabs';

Object.defineProperty(window, 'location', {
  value: {
    pathname: '/terminals',
    assign: jest.fn(),
  },
});

const options = [
  { label: 'Users', value: '/users' },
  { label: 'Security logs', value: '/security-logs' },
  { label: 'Settings', value: '/settings' },
];

describe('<Tabs />', () => {
  const renderTab = (onChange: TabsProps['onChange']) => customRender(<Tabs options={options} onChange={onChange} />);

  it('should render the tab items', () => {
    renderTab(value => console.log(value));
    expect(screen.getByRole('tab', { name: 'Users' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Settings' })).toBeInTheDocument();
  });

  describe('when tabs are first loaded', () => {
    it('first tab should have a `data-selected` attribute', () => {
      renderTab(value => console.log(value));
      const selectedTab = screen.getByRole('tab', { name: 'Users' });
      expect(selectedTab.getAttribute('data-state')).toEqual('active');
    });
  });

  describe('when clicking on one tab', () => {
    it('should set that tab to selected', async () => {
      renderTab(value => console.log(value));
      const firstTab = screen.getByRole('tab', { name: 'Users' });
      await userEvent.click(firstTab);
      expect(firstTab.getAttribute('data-state')).toEqual('active');
    });
  });

  describe('when clicking on the tab', () => {
    it('should trigger onChange event', async () => {
      const onChangeMockFn = jest.fn();
      renderTab(onChangeMockFn);
      const settingsTab = screen.getByRole('tab', { name: 'Settings' });
      await userEvent.click(settingsTab);
      expect(onChangeMockFn).toHaveBeenCalled();
    });
  });
});
