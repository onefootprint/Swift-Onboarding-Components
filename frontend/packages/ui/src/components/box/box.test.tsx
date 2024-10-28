import '../../config/initializers/i18next-test';

import { screen } from '@testing-library/react';
import { customRender } from '../../utils/test-utils';

import Box from './box';
import type { BoxProps } from './box.types';

describe('<Box />', () => {
  const renderBox = ({ as, children = 'some content', id, testID }: Partial<BoxProps>) =>
    customRender(
      <Box as={as} testID={testID} id={id}>
        {children}
      </Box>,
    );

  describe('<Box />', () => {
    it('should assign a testID', () => {
      renderBox({
        testID: 'box-test-id',
      });
      expect(screen.getByTestId('box-test-id')).toBeInTheDocument();
    });

    it('should assign a id', () => {
      renderBox({
        children: 'foo',
        id: 'some-id',
      });
      expect(screen.getByText('foo').id).toBe('some-id');
    });

    it('should render the content', () => {
      renderBox({
        children: 'some content',
      });
      expect(screen.getByText('some content')).toBeInTheDocument();
    });
  });
});
