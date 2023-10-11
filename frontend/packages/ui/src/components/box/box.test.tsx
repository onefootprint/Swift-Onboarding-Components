import themes from '@onefootprint/design-tokens';
import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import Box from './box';
import type { BoxProps } from './box.types';

describe('<Box />', () => {
  const renderBox = ({
    ariaLabel,
    as,
    children = 'some content',
    id,
    testID,
    sx,
  }: Partial<BoxProps>) =>
    customRender(
      <Box as={as} ariaLabel={ariaLabel} testID={testID} id={id} sx={sx}>
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

    it('should assign an aria label', () => {
      renderBox({
        ariaLabel: 'lorem',
        children: 'foo',
      });
      expect(screen.getByLabelText('lorem')).toBeInTheDocument();
    });

    it('should render as `section`', () => {
      renderBox({
        children: 'foo',
        as: 'section',
      });
      expect(screen.getByText('foo').tagName).toBe('SECTION');
    });

    it('should add the correct styles', () => {
      renderBox({
        children: 'foo',
        sx: {
          display: 'flex',
          backgroundColor: 'tertiary',
        },
      });
      expect(screen.getByText('foo')).toHaveStyle({
        display: 'flex',
        backgroundColor: themes.light.backgroundColor.tertiary,
      });
    });
  });
});
