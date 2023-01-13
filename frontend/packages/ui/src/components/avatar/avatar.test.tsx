import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import Avatar, { AvatarProps } from './avatar';

describe('<Avatar />', () => {
  const renderAvatar = ({
    name = 'Jane Doe',
    src,
    size = 'default',
  }: Partial<AvatarProps>) =>
    customRender(<Avatar name={name} size={size} src={src} />);

  describe('when the src is not defined', () => {
    it('should render the name first letter', () => {
      renderAvatar({ name: 'Jane Doe' });
      const fallback = screen.getByRole('img', { name: 'Jane Doe' });

      expect(fallback).toBeInTheDocument();
      expect(fallback.textContent).toEqual('J');
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
  });
});
