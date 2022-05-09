import React from 'react';
import { customRender, screen } from 'test-utils';

import Dropdown, { DropdownProps } from './dropdown';

describe('<Dropdown />', () => {
  const renderDropdown = ({
    children = 'some content',
    testID,
    maxHeight,
  }: Partial<DropdownProps>) =>
    customRender(
      <Dropdown testID={testID} maxHeight={maxHeight}>
        {children}
      </Dropdown>,
    );

  describe('<Dropdown />', () => {
    it('should assign a testID', () => {
      renderDropdown({
        testID: 'link-button-test-id',
      });
      expect(screen.getByTestId('link-button-test-id')).toBeInTheDocument();
    });

    it('should render the text', () => {
      renderDropdown({
        children: 'foo',
      });
      expect(screen.getByText('foo')).toBeInTheDocument();
    });

    describe('when it has a maxHeight defined', () => {
      it('should apply the maxHeight css', () => {
        renderDropdown({
          children: 'foo',
          maxHeight: '330px',
        });
        const container = screen.getByText('foo');
        expect(container).toHaveStyle({
          maxHeight: '330px',
        });
      });
    });
  });
});
