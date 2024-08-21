import { IcoArrowTopRight16, IcoInfo16 } from '@onefootprint/icons';
import type { WatchlistHit } from '@onefootprint/types';
import { LinkButton, Stack, Tooltip } from '@onefootprint/ui';

type RowProps = {
  hit: WatchlistHit;
};

const Row = ({ hit }: RowProps) => {
  const { entityName, entityAliases, agency, listName, agencyListUrl, listCountry } = hit;

  return (
    <>
      <td>
        {entityAliases.length ? (
          <Stack overflow="scroll">
            <Tooltip text={entityAliases.join(', ')} position="bottom" alignment="start">
              <Stack gap={2} align="center">
                {entityName}
                <IcoInfo16 />
              </Stack>
            </Tooltip>
          </Stack>
        ) : (
          entityName
        )}
      </td>
      <td>{agency}</td>
      <td>
        {agencyListUrl ? (
          <Stack overflow="scroll">
            <LinkButton href={agencyListUrl} iconComponent={IcoArrowTopRight16}>
              {listName as string}
            </LinkButton>
          </Stack>
        ) : (
          `${listName as string}`
        )}
      </td>
      <td>{listCountry}</td>
    </>
  );
};

export default Row;
