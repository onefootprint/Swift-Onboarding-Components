import { EntityKind } from '@onefootprint/types';
import { Box, Divider } from '@onefootprint/ui';
import { useEffect } from 'react';

import { MAIN_PAGE_ID } from 'src/config/constants';
import useSession from 'src/hooks/use-session';
import { createGlobalStyle, css } from 'styled-components';
import { useEntityContext } from '../../hooks/use-entity-context';
import useEntitySeqno from '../../hooks/use-entity-seqno';
import {
  AuditTrail,
  Banner,
  Breadcrumb,
  DecryptMachineProvider,
  DeviceInsights,
  DuplicateData,
  EditProvider,
  Header,
  HistoricalBar,
  OtherInsights,
  PinnedNotes,
  RiskSignals,
  Vault,
} from './components';
import BusinessInsights from './components/business-insights';
import Onboardings from './components/onboardings';

const Content = () => {
  const { kind } = useEntityContext();
  const shownSeqno = useEntitySeqno();
  const isHeadingDisabled = !!shownSeqno;
  useHistoricalLayout(!!shownSeqno);
  const {
    data: { user },
  } = useSession();
  const isFirmEmployee = user?.isFirmEmployee;

  return (
    <>
      <GlobalStyle />
      <Box tag="section" testID="entity-content">
        <Box marginBottom={7}>
          <Banner isDisabled={isHeadingDisabled} />
        </Box>
        <Box marginBottom={5}>
          <Breadcrumb isDisabled={isHeadingDisabled} />
        </Box>
        <Box>
          <PinnedNotes isDisabled={isHeadingDisabled} />
        </Box>
        <Box marginBottom={3}>
          <Header isDisabled={isHeadingDisabled} />
        </Box>
        <Box marginBottom={5}>
          <Divider />
        </Box>
        <Box marginBottom={9}>
          <Vault />
        </Box>
        {shownSeqno ? null : (
          <Box marginBottom={9}>
            <AuditTrail />
          </Box>
        )}
        {isFirmEmployee && kind === EntityKind.person && (
          <Box marginBottom={9}>
            <Onboardings />
          </Box>
        )}
        {kind === EntityKind.business && (
          <Box marginBottom={9}>
            <BusinessInsights />
          </Box>
        )}
        {!isFirmEmployee && kind === EntityKind.person && (
          <Box marginBottom={9}>
            <RiskSignals />
          </Box>
        )}
        {!shownSeqno && kind === EntityKind.person && (
          <Box marginBottom={9}>
            <DuplicateData />
          </Box>
        )}
        {shownSeqno ? null : (
          <>
            <Box marginBottom={9}>
              <DeviceInsights />
            </Box>
            <OtherInsights />
          </>
        )}
      </Box>
      {shownSeqno ? <HistoricalBar seqno={shownSeqno} /> : null}
    </>
  );
};

const useHistoricalLayout = (isHeadingDisabled: boolean) => {
  useEffect(() => {
    const layoutElement = document.getElementById(MAIN_PAGE_ID);
    if (isHeadingDisabled) {
      layoutElement?.classList.add('historical');
    } else {
      layoutElement?.classList.remove('historical');
    }
  }, [isHeadingDisabled]);
};

const GlobalStyle = createGlobalStyle`
  ${({ theme }) => css`
    #page-main.historical {
      background-color: ${theme.backgroundColor.secondary};
    }
  `}
`;

const ContentWithProviders = () => (
  <EditProvider>
    <DecryptMachineProvider>
      <Content />
    </DecryptMachineProvider>
  </EditProvider>
);

export default ContentWithProviders;
