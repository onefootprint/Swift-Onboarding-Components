import { Tag } from '@onefootprint/ui';
import React from 'react';

const createTagList = (
  tags: string[],
  customConnector?: string,
  customFinalConnector?: string,
): React.ReactNode => {
  const connector = customConnector ?? ', ';
  const finalConnector = customFinalConnector ?? ' and ';

  return tags.map((tag: string, i: number) => {
    let connectorForTag = '';
    if (tags.length === 2 && i === 0) {
      connectorForTag = finalConnector;
    }
    if (tags.length > 2) {
      if (i === tags.length - 2) {
        connectorForTag = finalConnector;
      } else if (i < tags.length - 2) {
        connectorForTag = connector;
      }
    }

    return (
      <React.Fragment key={tag}>
        <Tag>{tag}</Tag>
        {connectorForTag && <span>{connectorForTag}</span>}
      </React.Fragment>
    );
  });
};

export default createTagList;
