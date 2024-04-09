import React from 'react';

import type { LangProp } from '@/app/types';
import {
  getPartnerPartnershipsDocuments,
  getPartnerPartnershipsSubmissions,
} from '@/queries';

import ExternalLink from './external-link';
import Header from './header';

type Props = {
  params: LangProp & {
    partnerId: string;
    documentId: string;
    submissionId: string;
  };
  searchParams: { path?: string };
};

const iframeId = 'pdf-container';

const PartnerSubmissionViewerPage = async ({ params }: Props) => {
  const { partnerId, documentId, submissionId } = params;
  const [submission, document] = await Promise.all([
    getPartnerPartnershipsSubmissions(partnerId, submissionId),
    getPartnerPartnershipsDocuments(partnerId).then(list =>
      list.find(d => d.id === documentId),
    ),
  ]);

  const { data } = submission;
  const url = data.kind === 'external_url' ? data.data.url : undefined;
  const src = data.kind === 'file_upload' ? data.data.data : undefined;
  const fileName =
    data.kind === 'file_upload' ? data?.data.filename : undefined;

  return (
    <>
      <Header
        documentId={documentId}
        documentStatus={document?.status}
        iframeId={iframeId}
        partnerId={partnerId}
        submissionId={submissionId}
      >
        {document?.name || 'Document'}
      </Header>
      {url ? <ExternalLink url={url || ''} /> : null}
      {src ? (
        <iframe
          id={iframeId}
          title={`${fileName} || PDF container`}
          width="100%"
          height="100%"
          src={`data:application/pdf;base64,${src}`}
        />
      ) : null}
    </>
  );
};

export default PartnerSubmissionViewerPage;
