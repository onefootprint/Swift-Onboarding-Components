import { IcoArrowTopRight16, IcoInfo16 } from '@onefootprint/icons';
import { LinkButton, Tooltip } from '@onefootprint/ui';
import type { FormattedWatchlistHit } from '../../../../../../onboarding-business-insight.types';

type RowProps = {
  hit: FormattedWatchlistHit;
};

const Row = ({ hit: { entityName, entityAliases, agency, listName, agencyListUrl, listCountry } }: RowProps) => (
  <>
    <td>
      {entityAliases.length ? (
        <div className="flex overflow-scroll">
          <Tooltip text={entityAliases.join(', ')} position="bottom" alignment="start" asChild>
            <div className="flex items-center gap-1">
              {entityName}
              <IcoInfo16 />
            </div>
          </Tooltip>
        </div>
      ) : (
        entityName
      )}
    </td>
    <td>{agency}</td>
    <td>
      {agencyListUrl ? (
        <div className="flex overflow-scroll">
          <LinkButton href={agencyListUrl} iconComponent={IcoArrowTopRight16}>
            {listName as string}
          </LinkButton>
        </div>
      ) : (
        `${listName as string}`
      )}
    </td>
    <td>{listCountry}</td>
  </>
);

export default Row;
