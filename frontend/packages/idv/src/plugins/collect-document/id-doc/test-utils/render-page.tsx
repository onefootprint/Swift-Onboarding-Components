import '../../../../config/initializers/i18next-test';

import { Wrapper, render } from '@onefootprint/test-utils';
import type { ReactNode } from 'react';

import { Layout } from '../../../../components';
import { MissingPermissionsSheetProvider } from '../../components/missing-permissions-sheet';
import { MachineProvider } from '../components/machine-provider';
import type { MachineContext } from '../utils/state-machine';

const renderPage = (context: MachineContext, component: ReactNode, initState?: string) =>
  render(
    <Wrapper>
      <MachineProvider args={context} initState={initState}>
        <MissingPermissionsSheetProvider device={context.device}>
          <Layout>{component}</Layout>
        </MissingPermissionsSheetProvider>
      </MachineProvider>
    </Wrapper>,
  );

export default renderPage;
