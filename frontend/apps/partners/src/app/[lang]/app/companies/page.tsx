import React from 'react';

import Content from './content';

const CompaniesPage = () => {
  const list = [
    {
      id: '1',
      name: 'Company 1',
      controls: {
        total: 11,
        value: 3,
      },
      activePlaybooks: 1,
    },
    {
      id: '2',
      name: 'Company 2',
      controls: {
        total: 13,
        value: 5,
      },
      activePlaybooks: 3,
    },
    {
      id: '3',
      name: 'Company 3',
      controls: {
        total: 11,
        value: 3,
      },
      activePlaybooks: 3,
    },
  ];

  return <Content companies={list} />;
};

export default CompaniesPage;
