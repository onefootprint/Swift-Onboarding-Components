import { IcoUserCircle16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import type { AmlHit } from '@onefootprint/types';
import React from 'react';

import HitFieldRow from './components/hit-field-row';

type HitsProps = {
  hits: AmlHit[];
};

const Hits = ({ hits }: HitsProps) => {
  const flattenHit = (hit: AmlHit) => {
    const { name, matchTypes, fields } = hit;
    const sortedHits = [];
    if (name) sortedHits.push({ key: 'name', value: name });
    if (matchTypes) sortedHits.push({ key: 'matchTypes', value: matchTypes });
    if (fields) {
      const sortedFields = Object.keys(fields).sort();
      sortedFields.forEach(key => {
        if (fields[key]) {
          sortedHits.push({ key, value: fields[key] });
        }
      });
    }
    return sortedHits;
  };

  return (
    <>
      {hits.map((hit: AmlHit) => {
        const flattenedHit = flattenHit(hit);
        return (
          <HitContainer key={JSON.stringify(flattenedHit)}>
            <IconContainer>
              <IcoUserCircle16 />
            </IconContainer>
            {flattenedHit.map(({ key, value }) => (
              <HitFieldRow
                key={key}
                fieldName={key === 'locationurl' ? 'locationUrl' : key}
                fieldValue={value}
              />
            ))}
          </HitContainer>
        );
      })}
    </>
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
    padding: ${theme.spacing[5]} ${theme.spacing[5]} ${theme.spacing[4]};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
  `}
`;

export default Hits;
