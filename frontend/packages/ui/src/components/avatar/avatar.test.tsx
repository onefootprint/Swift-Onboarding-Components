import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import Avatar, { AvatarProps } from './avatar';

describe('<Avatar />', () => {
  const renderAvatar = ({
    loading = false,
    name = 'Jane Doe',
    size = 'default',
    src,
  }: Partial<AvatarProps>) =>
    customRender(
      <Avatar loading={loading} name={name} size={size} src={src} />,
    );

  describe('when the src is not defined', () => {
    it('should render the name first letter', () => {
      renderAvatar({ name: 'Jane Doe' });
      const fallback = screen.getByRole('img', { name: 'Jane Doe' });

      expect(fallback).toBeInTheDocument();
      expect(fallback.textContent).toEqual('J');
    });

    it('should show a loading state', () => {
      renderAvatar({ name: 'Jane Doe', loading: true });

      const loading = screen.getByRole('progressbar');
      expect(loading).toBeInTheDocument();
    });
  });

  describe('when the src is defined', () => {
    it('should render the image', () => {
      renderAvatar({
        name: 'Jane Doe',
        src: 'https://i.pravatar.cc/150?img=35',
      });
      const image = screen.getByRole('img', { name: 'Jane Doe' });

      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://i.pravatar.cc/150?img=35');
    });

    it('should show a loading state', () => {
      renderAvatar({
        name: 'Jane Doe',
        src: 'https://i.pravatar.cc/150?img=35',
        loading: true,
      });

      const loading = screen.getByRole('progressbar');
      expect(loading).toBeInTheDocument();
    });
  });
});
