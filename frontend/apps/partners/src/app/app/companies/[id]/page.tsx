import React from 'react';

import { PartnerDocumentStatus } from '@/config/types';

import Content from './content';

const Company = () => {
  // TODO: Integrate with backend
  const documents = [
    {
      id: '600af641-6a5b-4f5c-88f9-209847fdac72',
      name: 'Business Continuity/Disaster Recovery Plan',
      status: PartnerDocumentStatus.WaitingForReview,
      assignedTo: {
        id: '87619340-e021-4578-b91a-be6887d926a7',
        name: 'John Garcia',
      },
      lastUpdated: '2021-08-12T14:00:00Z',
    },
    {
      id: '3f2be208-ac0d-46fd-a3a4-d9faf4e5d881',
      name: 'Information Security Policy',
      status: PartnerDocumentStatus.WaitingForReview,
      assignedTo: {
        id: '87619340-e021-4578-b91a-be6887d926a7',
        name: 'Mary Klein',
      },
      lastUpdated: '2024-01-24:05:00Z',
    },
    {
      id: '995ac0fd-1a2c-485a-8852-3d78e019689d',
      name: 'Privacy Policy',
      status: PartnerDocumentStatus.Accepted,
      assignedTo: null,
      lastUpdated: null,
    },
    {
      id: 'c8609196-3ecb-4b3d-9488-b4d70c127cbc',
      name: 'Pitch Deck',
      status: PartnerDocumentStatus.NotUploaded,
      assignedTo: null,
      lastUpdated: null,
    },
    {
      id: 'd50c9351-a19f-47d7-b1c2-2a3e6b2accb8',
      name: 'Articles of Incorporation',
      status: PartnerDocumentStatus.NotUploaded,
      assignedTo: null,
      lastUpdated: null,
    },
    {
      id: '6173f7e7-76c3-4eda-9974-75249927a2ae',
      name: 'SLA',
      status: PartnerDocumentStatus.NotUploaded,
      assignedTo: null,
      lastUpdated: null,
    },
    {
      id: 'adfc1ae5-1c98-4cbc-a17a-c3d6107e00a3',
      name: 'Certificate of Insurance',
      status: PartnerDocumentStatus.NotUploaded,
      assignedTo: null,
      lastUpdated: null,
    },
    {
      id: 'cc05ac31-d664-48ea-95ee-697dc665b4e3',
      name: 'SOC II Report',
      status: PartnerDocumentStatus.Accepted,
      assignedTo: null,
      lastUpdated: '2024-01-22:05:00Z',
    },
    {
      id: 'e5d65101-a769-4ec9-8d69-18c2e19118fb',
      name: 'Audited Financials',
      status: PartnerDocumentStatus.NotUploaded,
      assignedTo: null,
      lastUpdated: null,
    },
    {
      id: '722d9f6c-08f0-47ca-9db3-cea41578a2f0',
      name: 'Vulnerability Scans',
      status: PartnerDocumentStatus.NotUploaded,
      assignedTo: null,
      lastUpdated: null,
    },
    {
      id: '3390f1e4-e52f-4c8a-bbec-c10c995a56d0',
      name: 'Pen Testing Statement',
      status: PartnerDocumentStatus.Accepted,
      assignedTo: null,
      lastUpdated: '2024-01-20:05:00Z',
    },
  ];
  const documentsStatus = {
    count: 11,
    accepted: 3,
    percentage: 27,
  };
  const securityChecks = {
    accessControl: true,
    dataAccess: true,
    strongAuthentication: true,
    dataEndToEndEncryption: true,
  };
  return (
    <Content
      documents={documents}
      documentsStatus={documentsStatus}
      securityChecks={securityChecks}
    />
  );
};

export default Company;
