import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import React from 'react';

import Router from './router';
import {
  confirmPlaybookRecommendation,
  enterName,
  selectWhoToOnboard,
} from './router.test.config';

const renderRouter = ({ onClose }: { onClose: () => void }) =>
  customRender(<Router onClose={onClose} />);

describe('<Router />', () => {
  it("should navigate from 'Who to Onboard' to 'Name your playbook' screen by way of stepper", async () => {
    renderRouter({ onClose: jest.fn() });
    await enterName();
    expect(
      screen.getByText('Who would you like to onboard?'),
    ).toBeInTheDocument();
    const nameYourPlaybook = screen.getByRole('button', {
      name: 'Name your Playbook',
    });
    await userEvent.click(nameYourPlaybook);
    expect(
      screen.getByText(
        'This helps you easily identify your Playbook, especially if you have multiple ones.',
      ),
    ).toBeInTheDocument();
  });

  it("should navigate from 'Who to Onboard' to 'Name your playbook' screen by way of back button", async () => {
    renderRouter({ onClose: jest.fn() });
    await enterName();
    expect(
      screen.getByText('Who would you like to onboard?'),
    ).toBeInTheDocument();
    const back = screen.getByRole('button', {
      name: 'Back',
    });
    await userEvent.click(back);
    expect(
      screen.getByText(
        'This helps you easily identify your Playbook, especially if you have multiple ones.',
      ),
    ).toBeInTheDocument();
  });

  it("should navigate from 'Your Playbook' to 'Who to onboard' screen by way of stepper", async () => {
    renderRouter({ onClose: jest.fn() });
    await enterName();
    await selectWhoToOnboard();
    expect(
      screen.getByText('Your Playbook recommendation'),
    ).toBeInTheDocument();

    const whoToOnboard = screen.getByRole('button', {
      name: 'Who to onboard',
    });
    await userEvent.click(whoToOnboard);
    expect(
      screen.getByText('Who would you like to onboard?'),
    ).toBeInTheDocument();
  });

  it("should navigate from 'Your Playbook' back to 'Name your Playbook' via stepper", async () => {
    renderRouter({ onClose: jest.fn() });
    await enterName();
    await selectWhoToOnboard();
    const nameYourPlaybook = screen.getByRole('button', {
      name: 'Name your Playbook',
    });
    await userEvent.click(nameYourPlaybook);
    expect(
      screen.getByText(
        'This helps you easily identify your Playbook, especially if you have multiple ones.',
      ),
    ).toBeInTheDocument();
  });

  it("should navigate from 'Your Playbook' to 'Who to onboard' screen by way of back button", async () => {
    renderRouter({ onClose: jest.fn() });
    await enterName();
    await selectWhoToOnboard();
    expect(
      screen.getByText('Your Playbook recommendation'),
    ).toBeInTheDocument();

    const backButton = screen.getByRole('button', {
      name: 'Back',
    });
    await userEvent.click(backButton);
    expect(
      screen.getByText('Who would you like to onboard?'),
    ).toBeInTheDocument();
  });

  it("should navigate from 'Your Playbook' to 'Authorized scopes'", async () => {
    renderRouter({ onClose: jest.fn() });
    await enterName();
    await selectWhoToOnboard();

    expect(
      screen.getByText('Your Playbook recommendation'),
    ).toBeInTheDocument();
    const next = screen.getByRole('button', { name: 'Next' });
    await userEvent.click(next);
    // stepper value and header
    expect(screen.getAllByText('Authorized scopes').length).toEqual(2);
  });

  it("should navigate from 'Authorized scopes' back to 'Your Playbook' with back button", async () => {
    renderRouter({ onClose: jest.fn() });
    await enterName();
    await selectWhoToOnboard();
    await confirmPlaybookRecommendation();
    const back = screen.getByRole('button', { name: 'Back' });
    await userEvent.click(back);
    expect(
      screen.getByText('Your Playbook recommendation'),
    ).toBeInTheDocument();
  });

  it("should navigate from 'Authorized scopes' back to 'Your Playbook' via stepper", async () => {
    renderRouter({ onClose: jest.fn() });
    await enterName();
    await selectWhoToOnboard();
    await confirmPlaybookRecommendation();
    const yourPlaybook = screen.getByRole('button', { name: 'Your Playbook' });
    await userEvent.click(yourPlaybook);
    expect(
      screen.getByText('Your Playbook recommendation'),
    ).toBeInTheDocument();
  });

  it("should navigate from 'Authorized scopes' back to 'Who to onboard' via stepper", async () => {
    renderRouter({ onClose: jest.fn() });
    await enterName();
    await selectWhoToOnboard();
    await confirmPlaybookRecommendation();
    const whoToOnboard = screen.getByRole('button', { name: 'Who to onboard' });
    await userEvent.click(whoToOnboard);
    expect(
      screen.getByText('Who would you like to onboard?'),
    ).toBeInTheDocument();
  });

  it("should navigate from 'Authorized scopes' back to 'Name your Playbook' via stepper", async () => {
    renderRouter({ onClose: jest.fn() });
    await enterName();
    await selectWhoToOnboard();
    await confirmPlaybookRecommendation();
    const nameYourPlaybook = screen.getByRole('button', {
      name: 'Name your Playbook',
    });
    await userEvent.click(nameYourPlaybook);
    expect(
      screen.getByText(
        'This helps you easily identify your Playbook, especially if you have multiple ones.',
      ),
    ).toBeInTheDocument();
  });
});
