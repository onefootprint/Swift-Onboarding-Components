import { afterAll, afterEach, beforeAll, describe, expect, it, mock } from 'bun:test';
import { cleanup, render, screen } from '@testing-library/react'; // eslint-disable-line testing-library/no-manual-cleanup
import userEvent from '@testing-library/user-event';
import React from 'react';

import { nextHeaders } from '@/test/modules';
import { withTranslations } from '@/test/providers';
import server from '@/test/requests-interception';

import DrawerTimeline from './drawer-timeline';

const renderWithI18n = withTranslations.bind(null, render);

mock.module('next/headers', nextHeaders);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());

describe.todo('DrawerTimeline', () => {
  it('should requested, submitted, assigned and accepted events', async () => {
    await renderWithI18n(
      <DrawerTimeline
        partnerId="1"
        docId="2"
        docStatus="accepted"
        isOpen
        lang="en"
        onClose={() => undefined}
        onViewSubmissionClick={() => undefined}
      />,
    );

    expect(await screen.findByText(/requested/i)).toBeTruthy();

    expect(screen.getByText(/uploaded the document/i)).toBeTruthy();
    expect(screen.getByText(/view submission/i)).toBeTruthy();

    expect(screen.getByText(/Assigned to/i)).toBeTruthy();
    expect(screen.getByText(/Alex Sasha/i)).toBeTruthy();

    expect(screen.getByText(/reviewed the document/i)).toBeTruthy();
    expect(screen.getByText(/document accepted/i)).toBeTruthy();
    expect(screen.getByText(/nice/i)).toBeTruthy();
  });

  it('should call onViewSubmissionClick', async () => {
    /** @ts-ignore: mock does not have the correct type */
    const onViewSubmissionClickMock = mock();

    await renderWithI18n(
      <DrawerTimeline
        partnerId="1"
        docId="submitted_3"
        docStatus="submitted"
        isOpen
        lang="en"
        onClose={() => undefined}
        onViewSubmissionClick={onViewSubmissionClickMock}
      />,
    );

    const viewLink = await screen.findByText(/View Submission/i);
    await userEvent.click(viewLink);

    expect(onViewSubmissionClickMock.mock.lastCall).toEqual(['submitted_3', 'sub_12']);
  });
});
