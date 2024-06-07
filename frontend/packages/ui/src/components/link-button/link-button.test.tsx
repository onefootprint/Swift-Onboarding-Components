import '../../config/initializers/i18next-test';

import { IcoArrowRightSmall24 } from '@onefootprint/icons';
import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import React from 'react';

import type { LinkButtonProps } from './link-button';
import LinkButton from './link-button';

describe('<LinkButton />', () => {
  const renderLinkButton = ({
    ariaLabel,
    children = 'some content',
    href,
    iconComponent: Icon,
    iconPosition,
    onClick,
    target,
    testID,
    disabled = false,
    destructive = false,
    variant,
  }: Partial<LinkButtonProps>) =>
    customRender(
      <LinkButton
        ariaLabel={ariaLabel}
        href={href}
        iconComponent={Icon}
        iconPosition={iconPosition}
        onClick={onClick}
        target={target}
        testID={testID}
        variant={variant}
        disabled={disabled}
        destructive={destructive}
      >
        {children}
      </LinkButton>,
    );

  describe('<LinkButton />', () => {
    it('should render the text', () => {
      renderLinkButton({
        children: 'Link button',
      });
      expect(screen.getByRole('button', { name: 'Link button' })).toBeInTheDocument();
    });

    it('should assign an aria label', () => {
      renderLinkButton({
        ariaLabel: 'lorem',
        children: 'Link button',
      });
      expect(screen.getByLabelText('lorem')).toBeInTheDocument();
    });

    it('should trigger onClick event when clicking', async () => {
      const onClickMockFn = jest.fn();
      renderLinkButton({ children: 'Link button', onClick: onClickMockFn });
      await userEvent.click(screen.getByRole('button', { name: 'Link button' }));
      expect(onClickMockFn).toHaveBeenCalledTimes(1);
    });

    describe('when the button is disabled', () => {
      it('should NOT fire an event when pressing', async () => {
        const onClickMockFn = jest.fn();
        renderLinkButton({
          children: 'Link button',
          onClick: onClickMockFn,
          disabled: true,
        });
        await userEvent.click(screen.getByRole('button', { name: 'Link button' }));
        expect(onClickMockFn).not.toHaveBeenCalled();
      });
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
          iconComponent: IcoArrowRightSmall24,
        });
        expect(screen.getByRole('button', { name: 'foo' })).toContainHTML('svg');
      });
    });
  });
});
