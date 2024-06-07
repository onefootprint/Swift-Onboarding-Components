import { mockRequest } from '@onefootprint/test-utils';
import type { CreateOrgFrequentNoteResponse, GetOrgFrequentNotesResponse } from '@onefootprint/types';
import { OrgFrequentNoteKind } from '@onefootprint/types';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import FrequentNotesTextArea from './frequent-notes-text-area';

export const Form = () => {
  const methods = useForm();
  return (
    <FormProvider {...methods}>
      <FrequentNotesTextArea kind={OrgFrequentNoteKind.Annotation} formField="note" label="Note" required />
    </FormProvider>
  );
};

export const withFrequentNotes = (kind: OrgFrequentNoteKind, resp: GetOrgFrequentNotesResponse, once?: boolean) => {
  mockRequest({
    method: 'get',
    path: '/org/frequent_notes',
    queryParams: new URLSearchParams({
      kind,
    }),
    once,
    response: resp,
  });
};

export const withPlaybooks = () => {
  mockRequest({
    method: 'get',
    path: '/org/onboarding_configs',
    queryParams: new URLSearchParams({
      kinds: 'document,kyb,kyc',
      page_size: '100',
    }),
    response: [
      {
        name: 'My playbook',
        id: 'obc_123',
      },
    ],
  });
};

export const withCreateFrequentNote = (resp: CreateOrgFrequentNoteResponse) => {
  mockRequest({
    method: 'post',
    path: '/org/frequent_notes',
    once: true,
    response: resp,
  });
};

export const withDeleteFrequentNote = (id: string) => {
  mockRequest({
    method: 'delete',
    path: `/org/frequent_notes/${id}`,
    once: true,
    response: {},
  });
};
