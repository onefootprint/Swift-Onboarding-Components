import '../../config/initializers/i18next-test';

import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import type { TagProps } from './tag';
import Tag from './tag';

describe('<Tag />', () => {
  const renderBadge = ({ children = 'Foo' }: Partial<TagProps>) => customRender(<Tag>{children}</Tag>);

  it('should render the text', () => {
    renderBadge({ children: 'Tag content' });
    expect(screen.getByText('Tag content')).toBeInTheDocument();
  });
});
