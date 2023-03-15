import { Tag } from '@onefootprint/ui';
import React from 'react';

const createTagList = (tags: string[]): React.ReactNode =>
  tags.map((tag: string) => (
    <React.Fragment key={tag}>
      <Tag>{tag}</Tag>
    </React.Fragment>
  ));

export default createTagList;
