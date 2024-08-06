import { IcoUserCircle16 } from '@onefootprint/icons';
import type { AmlHit, AmlHitMedia } from '@onefootprint/types';
import { useState } from 'react';
import styled, { css } from 'styled-components';

import HitItemRow from './components/hit-item-row';

type HitItemProps = {
  hit: AmlHit;
  handleShowAmlMedia: (media: AmlHitMedia[]) => void;
};

const MAX_NUM_FIELDS_SHOWN = 6;

const HitItem = ({ hit, handleShowAmlMedia }: HitItemProps) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const flattenHit = () => {
    const { name, matchTypes, fields, media } = hit;
    const sortedHit = [];

    if (name) sortedHit.push({ key: 'name', value: name });
    if (matchTypes) sortedHit.push({ key: 'matchTypes', value: matchTypes });

    if (fields) {
      const numTotalFields = Object.keys(fields).length;
      const numFieldsShown = isCollapsed ? MAX_NUM_FIELDS_SHOWN : numTotalFields;
      const sortedFields = Object.keys(fields).sort().slice(0, numFieldsShown);
      sortedFields.forEach(key => {
        if (fields[key]) {
          sortedHit.push({ key, value: fields[key] });
        }
      });
      if (isCollapsed) {
        sortedHit.push({
          key: 'showAll',
          value: numTotalFields - numFieldsShown,
        });
      }
    }

    if (media && media.length) sortedHit.push({ key: 'relevantMedia', value: media });

    return sortedHit;
  };

  const flattenedHit = flattenHit();

  return (
    <HitContainer key={JSON.stringify(flattenedHit)}>
      <IconContainer>
        <IcoUserCircle16 />
      </IconContainer>
      {flattenedHit.map(({ key, value }) => (
        <HitItemRow
          key={key}
          fieldName={key}
          fieldValue={value}
          handleShowAllFields={() => setIsCollapsed(false)}
          handleShowAmlMedia={handleShowAmlMedia}
        />
      ))}
    </HitContainer>
  );
};

const IconContainer = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[2]};
  `}
`;

const HitContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};
    margin: ${theme.spacing[3]} 0;
    padding: ${theme.spacing[5]} 0 ${theme.spacing[4]};
    border-top: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    transition: background 0.2s ease-in-out;
  `}
`;

export default HitItem;
