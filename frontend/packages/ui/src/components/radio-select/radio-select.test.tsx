import '../../config/initializers/i18next-test';

import { IcoAndroid16, IcoApple16 } from '@onefootprint/icons';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { customRender } from '../../utils/test-utils';

import type { RadioSelectProps } from './radio-select';
import RadioSelect from './radio-select';

describe('<RadioSelect />', () => {
  const renderRadioSelect = ({ value, testID, onChange = () => undefined }: Partial<RadioSelectProps>) => {
    const options = [
      {
        title: 'Item 1',
        description: 'Description 1',
        IconComponent: IcoAndroid16,
        value: 'Item 1',
      },
      {
        title: 'Item 2',
        description: 'Description 2',
        IconComponent: IcoApple16,
        value: 'Item 2',
      },
    ];

    return customRender(<RadioSelect options={options} value={value} onChange={onChange} testID={testID} />);
  };

  describe('<RadioSelect />', () => {
    it('should assign a testID', () => {
      renderRadioSelect({
        testID: 'radio-select-test-id',
      });
      expect(screen.getByTestId('radio-select-test-id')).toBeInTheDocument();
    });

    describe('when an option is selected', () => {
      it('should have selected option', () => {
        renderRadioSelect({
          value: 'Item 2',
          options: [
            {
              title: 'Item 1',
              description: 'Description 1',
              IconComponent: IcoAndroid16,
              value: 'Item 1',
            },
            {
              title: 'Item 2',
              description: 'Description 2',
              IconComponent: IcoApple16,
              value: 'Item 2',
            },
          ],
        });

        const option = screen.getByRole('button', { name: 'Item 2' });
        expect(option).toHaveAttribute('aria-selected', 'true');
      });
    });

    describe('when clicking on an option', () => {
      it('should trigger onChange event', async () => {
        const onChangeMockFn = jest.fn();
        renderRadioSelect({
          onChange: onChangeMockFn,
        });

        const option = screen.getByRole('button', { name: 'Item 2' });
        await userEvent.click(option);

        expect(onChangeMockFn).toHaveBeenCalled();
      });
    });
  });
});

describe('<GroupedRadioSelect />', () => {
  const renderGroupedRadioSelect = ({ value, testID, onChange = () => undefined }: Partial<RadioSelectProps>) => {
    const groupedOptions = [
      {
        label: 'Group 1',
        options: [
          {
            title: 'Item 1',
            description: 'Description 1',
            IconComponent: IcoAndroid16,
            value: 'Item 1',
          },
          {
            title: 'Item 2',
            description: 'Description 2',
            IconComponent: IcoApple16,
            value: 'Item 2',
          },
        ],
      },
      {
        label: 'Group 2',
        options: [
          {
            title: 'Item 3',
            description: 'Description 3',
            IconComponent: IcoAndroid16,
            value: 'Item 3',
          },
          {
            title: 'Item 4',
            description: 'Description 4',
            IconComponent: IcoApple16,
            value: 'Item 4',
          },
        ],
      },
    ];

    return customRender(<RadioSelect options={groupedOptions} value={value} onChange={onChange} testID={testID} />);
  };

  describe('<GroupedRadioSelect />', () => {
    it('should render titles for each subgroup', () => {
      renderGroupedRadioSelect({});
      expect(screen.getByText('Group 1')).toBeInTheDocument();
      expect(screen.getByText('Group 2')).toBeInTheDocument();
    });
  });
});
