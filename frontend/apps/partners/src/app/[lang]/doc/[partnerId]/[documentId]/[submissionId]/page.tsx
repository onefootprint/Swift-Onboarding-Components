import React from 'react';

import type { LangProp } from '@/app/types';
import { getPartnerPartnershipsDocuments, getPartnerPartnershipsSubmissions } from '@/queries';

import DocIFrame from './doc-iframe';
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
    getPartnerPartnershipsDocuments(partnerId).then(list => list.find(d => d.id === documentId)),
  ]);

  const { data } = submission;
  const url = data.kind === 'external_url' ? data.data.url : undefined;

  const base64Data = data.kind === 'file_upload' ? data.data.data : undefined;
  const fileName = data.kind === 'file_upload' ? data?.data.filename : undefined;

  return (
    <>
      <Header
        documentId={documentId}
        documentStatus={document?.status}
        iframeId={iframeId}
        partnerId={partnerId}
        submissionId={submissionId}
        kind={data.kind}
      >
        {document?.name || 'Document'}
      </Header>
      {url ? <ExternalLink url={url || ''} /> : null}
      <DocIFrame id={iframeId} fileName={fileName || 'Document Submission'} base64Data={base64Data} />
    </>
  );
};

export default PartnerSubmissionViewerPage;
