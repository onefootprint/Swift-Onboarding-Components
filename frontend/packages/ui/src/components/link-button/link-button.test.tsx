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
    onPress,
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
        onPress={onPress}
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
      expect(screen.getByTestId('link-button-test-id')).toBeTruthy();
    });

    it('should render the text', () => {
      renderLinkButton({
        children: 'foo',
      });
      expect(screen.getByText('foo')).toBeTruthy();
    });

    it('should render the aria label', () => {
      renderLinkButton({
        ariaLabel: 'lorem',
        children: 'foo',
      });
      expect(screen.getByLabelText('lorem')).toBeInTheDocument();
    });

    it('should trigger onPress event when clicking', async () => {
      const onPressMockFn = jest.fn();
      renderLinkButton({ children: 'foo', onPress: onPressMockFn });
      await userEvent.click(screen.getByText('foo'));
      expect(onPressMockFn).toHaveBeenCalledTimes(1);
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
