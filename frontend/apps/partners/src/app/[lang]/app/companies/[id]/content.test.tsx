import { afterEach, describe, expect, it, mock } from 'bun:test';
import { cleanup, render, screen } from '@testing-library/react'; // eslint-disable-line testing-library/no-manual-cleanup
import userEvent from '@testing-library/user-event';

import type { PartnerDocument } from '@/queries';
import { nextNavigation, replaceMock } from '@/test/modules';
import { withTranslations } from '@/test/providers';
import { documents, members, securityChecks, unusedTemplates } from '@/test/responses';

import CompanyPageContent from './content';

mock.module('next/navigation', nextNavigation);

const lang = 'en';
const renderWithI18n = withTranslations.bind(null, render);
const customRender = async () =>
  renderWithI18n(
    <CompanyPageContent
      documents={documents as unknown as PartnerDocument[]}
      documentsStatus={{ accepted: 5, count: 10, percentage: 50 }}
      lang={lang}
      members={members}
      partnerId="tcp_TWgsHzTVhlyhB9vcOuioFW"
      partnerName="Acme Inc."
      securityChecks={securityChecks}
      templatesUnused={unusedTemplates}
    />,
  );

afterEach(cleanup);

describe('PartnerDocsPageContent Component', () => {
  it('Should contain a list of documents', async () => {
    await customRender();

    expect(screen.getByText('Acme Inc.')).toBeTruthy();
    expect(screen.getByText('50% completed')).toBeTruthy();
    expect(screen.getByText('5/10 Controls completed')).toBeTruthy();
    expect(screen.getByText('Document A')).toBeTruthy();
    expect(screen.getByText('Document B')).toBeTruthy();
  });

  it('should open the right dialogs', async () => {
    await customRender();
    // Supposed to open the "request document" dialog
    await userEvent.click(screen.getByText('Request document'));
    expect(replaceMock.mock.lastCall).toEqual(['test/path?dialog=additional']);

    // Supposed to open the "timeline" dialog
    await userEvent.click(screen.getByText('Document A'));
    expect(replaceMock.mock.lastCall).toEqual(['test/path?dialogId=cd_4s7f7xgLTTp7wzznuP7077&dialog=timeline']);
  });
});
