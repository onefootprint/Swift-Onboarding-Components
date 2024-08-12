import { Stack } from '@onefootprint/ui';
import TypeBadge from 'src/pages/api-reference/components/type-badge';
import { HydratedApiArticle } from 'src/pages/api-reference/hooks/use-hydrate-articles';
import styled from 'styled-components';

type ApiTitleProps = {
  api: HydratedApiArticle;
};

const ApiTitle = ({ api }: ApiTitleProps) => {
  return (
    <Stack direction="row" alignItems="center" gap={3}>
      <TypeBadge skinny type={api.method} />
      <PathLabel>{api.path}</PathLabel>
    </Stack>
  );
};

const PathLabel = styled.span`
   text-transform: lowercase;
   white-space: nowrap;
   text-overflow: ellipsis;
   width: 100%;
   display: block;
   overflow: hidden;
   max-width: 100%;
 `;

export default ApiTitle;
