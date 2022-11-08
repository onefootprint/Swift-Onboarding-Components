import { customRender, screen } from '@onefootprint/test-utils';

import createTagList from './create-tag-list';

describe('createTagList', () => {
  const renderTagList = (
    tags: string[],
    connector?: string,
    finalConnector?: string,
  ) => customRender(createTagList(tags, connector, finalConnector));

  it('list with 1 item renders correctly', () => {
    renderTagList(['apple']);
    expect(screen.getByText('apple')).toBeInTheDocument();
  });

  it('list with 2 items renders correctly', () => {
    const items = ['apple', 'pear'];
    renderTagList(items);
    expect(screen.getByText('apple')).toBeInTheDocument();
    expect(screen.getByText('and')).toBeInTheDocument();
    expect(screen.getByText('pear')).toBeInTheDocument();
  });

  it('list with 2+ items renders correctly', () => {
    const items = ['apple', 'pear', 'berry'];
    renderTagList(items);
    expect(screen.getByText('apple')).toBeInTheDocument();
    expect(screen.getByText(',')).toBeInTheDocument();
    expect(screen.getByText('pear')).toBeInTheDocument();
    expect(screen.getByText('and')).toBeInTheDocument();
    expect(screen.getByText('berry')).toBeInTheDocument();
  });
});
