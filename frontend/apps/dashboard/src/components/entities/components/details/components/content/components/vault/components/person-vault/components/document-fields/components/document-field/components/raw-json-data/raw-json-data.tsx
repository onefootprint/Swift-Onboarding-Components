import { IcoFileText24 } from '@onefootprint/icons';
import type {
  DocumentDI,
  EntityVault,
  SupportedIdDocTypes,
} from '@onefootprint/types';
import { RawJsonKinds } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import CollapsibleSection from './components/collapsible-section';

type RawJsonDataProps = {
  vault: EntityVault;
  documentType: SupportedIdDocTypes;
  curpCompletedVersion?: string | null;
};

const getRawJsonData = ({
  vault,
  documentType,
  curpCompletedVersion,
}: RawJsonDataProps) => {
  const rawJsonKinds: RawJsonKinds[] = Object.values(RawJsonKinds);
  const rawJsonData: {
    rawJsonKind: RawJsonKinds;
    rawJsonData: string;
  }[] = [];
  rawJsonKinds.forEach(kind => {
    let di = `document.${documentType}.${kind}` as DocumentDI;
    if (curpCompletedVersion) {
      di =
        `document.${documentType}.${kind}:${curpCompletedVersion}` as DocumentDI;
    }
    if (typeof vault[di] === 'string') {
      rawJsonData.push({
        rawJsonKind: kind,
        rawJsonData: vault[di] as string,
      });
    }
  });
  return rawJsonData;
};

const RawJsonData = ({
  vault,
  documentType,
  curpCompletedVersion,
}: RawJsonDataProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.fieldset.document.drawer.raw-json-data',
  });
  const rawJsonData = getRawJsonData({
    vault,
    documentType,
    curpCompletedVersion,
  });
  if (!rawJsonData.length) {
    return null;
  }
  return (
    <Stack direction="column" gap={4} paddingBottom={9}>
      <LabelContainer>
        <IcoFileText24 />
        <Text variant="label-2">{t('title')}</Text>
      </LabelContainer>
      {rawJsonData.map(({ rawJsonKind: kind, rawJsonData: data }) => (
        <CollapsibleSection key={kind} rawJsonKind={kind} rawJsonData={data} />
      ))}
    </Stack>
  );
};

const LabelContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[2]};
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
  `};
`;

export default RawJsonData;
