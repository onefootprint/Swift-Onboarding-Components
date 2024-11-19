import { getCountryNameFromCode } from '@onefootprint/global-constants';
import type { CountrySpecificDocumentMapping, IdDocKind } from '@onefootprint/request-types/dashboard';
import type { CountryCode } from '@onefootprint/types';
import { Flag, Stack, Text } from '@onefootprint/ui';
import styled, { css } from 'styled-components';
import IdDocList from '../id-doc-list';

type CountryDocListProps = {
  countryDocs: CountrySpecificDocumentMapping;
};

const CountryDocList = ({ countryDocs }: CountryDocListProps) => {
  return (
    <Stack flexDirection="column" gap={2} alignItems="center">
      {(Object.entries(countryDocs) as Array<[CountryCode, IdDocKind[]]>).map(([code, docs]) => {
        const countryName = getCountryNameFromCode(code);
        return (
          // biome-ignore lint/a11y/useSemanticElements: TODO: change to <tr />
          <Row key={countryName} role="row">
            <Label variant="body-3" color="tertiary">
              <Flag code={code} />
              {countryName}
            </Label>
            <IdDocList docs={docs} limit={1} />
          </Row>
        );
      })}
    </Stack>
  );
};

const Row = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    gap: ${theme.spacing[10]};
    height: ${theme.spacing[7]};
    justify-content: space-between;
    width: 100%;
  `}
`;

const Label = styled(Text)`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    gap: ${theme.spacing[2]};
    text-align: right;
    white-space: nowrap;
  `}
`;

export default CountryDocList;
