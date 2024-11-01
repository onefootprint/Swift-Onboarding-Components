import { getCountryNameFromCode } from '@onefootprint/global-constants';
import type { CountryCode, SupportedIdDocTypes } from '@onefootprint/types';
import { Flag, Text } from '@onefootprint/ui';
import styled, { css } from 'styled-components';
import IdDocList from '../id-doc-list';

type CountryDocListProps = {
  countryDocs: Partial<Record<CountryCode, SupportedIdDocTypes[]>>;
};

const CountryDocList = ({ countryDocs }: CountryDocListProps) => {
  return (
    <Container>
      {Object.entries(countryDocs).map(([code, docs]) => {
        const countryCode = code as CountryCode;
        const countryName = getCountryNameFromCode(countryCode);

        return (
          // biome-ignore lint/a11y/useSemanticElements: TODO: change to <tr />
          <Row key={countryName} role="row">
            <Label variant="body-3" color="tertiary">
              <Flag code={countryCode} />
              {countryName}
            </Label>
            <IdDocList docs={docs as SupportedIdDocTypes[]} limit={1} />
          </Row>
        );
      })}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[2]};
  `}
`;

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
