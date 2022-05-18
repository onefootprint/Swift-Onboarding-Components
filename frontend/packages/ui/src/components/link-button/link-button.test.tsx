import IcoArrowRightSmall24 from 'icons/ico/ico-arrow-right-small-24';
import React from 'react';
import { customRender, screen, userEvent } from 'test-utils';

import LinkButton, { LinkButtonProps } from './link-button';

describe('<LinkButton />', () => {
  const renderLinkButton = ({
    ariaLabel,
    children = 'some content',
    href,
    Icon,
    iconPosition,
    onClick,
    size = 'default',
    target,
    testID,
  }: Partial<LinkButtonProps>) =>
    customRender(
      <LinkButton
        ariaLabel={ariaLabel}
        href={href}
        Icon={Icon}
        iconPosition={iconPosition}
        onClick={onClick}
        size={size}
        target={target}
        testID={testID}
      >
        {children}
      </LinkButton>,
    );

  describe('<LinkButton />', () => {
    it('should assign a testID', () => {
      renderLinkButton({
        testID: 'link-button-test-id',
      });
      expect(screen.getByTestId('link-button-test-id')).toBeInTheDocument();
    });

    it('should render the text', () => {
      renderLinkButton({
        children: 'foo',
      });
      expect(screen.getByText('foo')).toBeInTheDocument();
    });

    it('should assign an aria label', () => {
      renderLinkButton({
        ariaLabel: 'lorem',
        children: 'foo',
      });
      expect(screen.getByLabelText('lorem')).toBeInTheDocument();
    });

    it('should trigger onClick event when clicking', async () => {
      const onClickMockFn = jest.fn();
      renderLinkButton({ children: 'foo', onClick: onClickMockFn });
      await userEvent.click(screen.getByText('foo'));
      expect(onClickMockFn).toHaveBeenCalledTimes(1);
    });

    describe('when the href prop is present', () => {
      it('should render the component as an anchor', () => {
        renderLinkButton({
          children: 'foo',
          href: 'https://onefootprint.com',
        });
        const link = screen.getByRole('link', { name: 'foo' });
        expect(link).toBeInTheDocument();
      });

      describe('when it has target', () => {
        it('should assign the native target property', () => {
          renderLinkButton({
            children: 'foo',
            href: 'https://onefootprint.com',
            target: '_blank',
            testID: 'button-test-id',
          });
          const link = screen.getByRole('link', {
            name: 'foo',
          }) as HTMLAnchorElement;
          expect(link.target).toBe('_blank');
        });

        it('should assign the rel noopener when target is blank', () => {
          renderLinkButton({
            children: 'foo',
            href: 'https://onefootprint.com',
            target: '_blank',
            testID: 'button-test-id',
          });
          const link = screen.getByRole('link', {
            name: 'foo',
          }) as HTMLAnchorElement;
          expect(link.rel).toBe('noopener noreferrer');
        });
      });
    });

    describe('when the href prop is NOT present', () => {
      it('should render the component as a button', () => {
        renderLinkButton({
          children: 'foo',
        });
        const button = screen.getByRole('button', { name: 'foo' });
        expect(button).toBeInTheDocument();
      });
    });

    describe('when passing an Icon', () => {
      it('should render the Icon', () => {
        renderLinkButton({
          children: 'foo',
          Icon: IcoArrowRightSmall24,
        });
        expect(screen.getByRole('button', { name: 'foo' })).toContainHTML(
          'svg',
        );
      });
    });
  });
});
