import '../../../config/initializers/i18next-test';

import { render, Wrapper } from '@onefootprint/test-utils';
import type { ReactNode } from 'react';
import React from 'react';

import { Layout } from '../../../components';
import { MachineProvider } from '../components/machine-provider';
import { MissingPermissionsSheetProvider } from '../components/missing-permissions-sheet';
import type { MachineContext } from '../utils/state-machine';

const renderPage = (
  context: MachineContext,
  component: ReactNode,
  initState?: string,
) =>
  render(
    <Wrapper>
      <MachineProvider args={context} initState={initState}>
        <MissingPermissionsSheetProvider>
          <Layout>{component}</Layout>
        </MissingPermissionsSheetProvider>
      </MachineProvider>
    </Wrapper>,
  );

export default renderPage;
