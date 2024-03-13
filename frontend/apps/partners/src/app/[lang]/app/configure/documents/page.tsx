import React from 'react';

import Content from './components/content';

const DocumentsPage = () => {
  const templates = [
    {
      id: '1',
      name: 'Business Continuity/Disaster Recovery Plan',
      format: 'PDF',
      frequency: 'one_time',
      lastUpdated: '2021-08-12T14:00:00Z',
    },
    {
      id: '2',
      name: 'Information Security Policy',
      format: 'PDF',
      frequency: 'one_time',
      lastUpdated: null,
    },
    {
      id: '3',
      name: 'Privacy Policy',
      format: 'PDF',
      frequency: 'one_time',
      lastUpdated: null,
    },
    {
      id: '4',
      name: 'Pitch Deck',
      format: 'PDF',
      frequency: 'one_time',
      lastUpdated: null,
    },
    {
      id: '5',
      name: 'Articles of Incorporation',
      format: 'PDF',
      frequency: 'one_time',
      lastUpdated: null,
    },
    {
      id: '6',
      name: 'SLA',
      format: 'PDF',
      frequency: 'one_time',
      lastUpdated: null,
    },
    {
      id: '7',
      name: 'Certificate of Insurance',
      format: 'PDF',
      frequency: 'one_time',
      lastUpdated: '2021-08-12T14:00:00Z',
    },
    {
      id: '8',
      name: 'SOC II Report',
      format: 'PDF',
      frequency: 'one_time',
      lastUpdated: null,
    },
    {
      id: '9',
      name: 'Audited Financials',
      format: 'PDF',
      frequency: 'one_time',
      lastUpdated: null,
    },
    {
      id: '10',
      name: 'Vulnerability Scans',
      format: 'PDF',
      frequency: 'one_time',
      lastUpdated: '2021-08-12T14:00:00Z',
    },
  ];
  return <Content templates={templates} />;
};

export default DocumentsPage;
