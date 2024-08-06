import { type StepUpEventData } from '@onefootprint/types';
import { Stack, Text, createFontStyles } from '@onefootprint/ui';
import { Trans } from 'react-i18next';
import useSession from 'src/hooks/use-session';
import styled, { css } from 'styled-components';

import Details from './components';

type StepUpEventHeaderProps = {
  data: StepUpEventData;
};

const StepUpEventHeader = ({ data }: StepUpEventHeaderProps) => {
  const { ruleSetResultId } = data[0];
  const { isLive } = useSession();

  return (
    <Stack direction="row" align="center" gap={2}>
      <Text variant="body-3">
        <Trans
          i18nKey="pages.entity.audit-trail.timeline.step-up-event.step-up-required"
          components={{
            b: <Bold />,
          }}
        />
      </Text>
      {isLive && <Details ruleSetResultId={ruleSetResultId} />}
    </Stack>
  );
};

const Bold = styled.b`
  ${({ theme }) => css`
    ${createFontStyles('label-3')};
    color: ${theme.color.primary};
  `}
`;

export default StepUpEventHeader;
