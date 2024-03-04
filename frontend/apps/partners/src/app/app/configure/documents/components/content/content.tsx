'use client';

import { Button, Divider, Stack, Text } from '@onefootprint/ui';
import React from 'react';

import type { PartnerDocumentTemplate } from '@/config/types';

import List from './components/list';

type ContentProps = {
  templates: PartnerDocumentTemplate[];
};

const Content = ({ templates }: ContentProps) => (
  <>
    <Stack gap={2} marginBottom={7} direction="column">
      <Text variant="heading-2">Documents</Text>
      <Text variant="body-2" color="secondary">
        List of documents that your customers have to upload to stay compliant.{' '}
      </Text>
    </Stack>
    <Stack justifyContent="space-between" align="center">
      <Stack gap={2} direction="column">
        <Text variant="label-1">Documents template</Text>
        <Text variant="body-3" color="secondary" maxWidth="770px">
          By default all companies you work with will need to upload the
          documents listed in your documents template. If you wish, you may
          request additional documents from specific companies.
        </Text>
      </Stack>
      <Button variant="secondary" size="compact">
        Add document
      </Button>
    </Stack>
    <Divider marginTop={5} marginBottom={7} />
    <List templates={templates} />
  </>
);

export default Content;
