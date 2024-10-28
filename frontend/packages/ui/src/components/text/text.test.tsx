import '../../config/initializers/i18next-test';

import { screen } from '@testing-library/react';
import { customRender } from '../../utils/test-utils';

import Text from './text';

describe('<Text />', () => {
  it('should render the content', () => {
    customRender(
      <Text variant="caption-2" color="primary">
        foo
      </Text>,
    );
    expect(screen.getByText('foo')).toBeInTheDocument();
  });

  it('should assign a testID', () => {
    customRender(
      <Text variant="display-1" color="primary" testID="typography-test-id">
        foo
      </Text>,
    );
    expect(screen.getByTestId('typography-test-id')).toBeInTheDocument();
  });

  it('should assign an ID', () => {
    customRender(
      <Text variant="display-1" color="primary" id="typography-id">
        foo
      </Text>,
    );
    expect(screen.getByText('foo').id).toEqual('typography-id');
  });
});
