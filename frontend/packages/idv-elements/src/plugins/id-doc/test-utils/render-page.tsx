import { render, Wrapper } from '@onefootprint/test-utils';
import React, { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { Layout } from 'src/components';

import { MachineProvider } from '../components/machine-provider';
import { MissingPermissionsSheetProvider } from '../components/missing-permissions-sheet';
import configureI18next from '../config/initializers/i18next';
import { MachineContext } from '../utils/state-machine';

const renderPage = (
  context: MachineContext,
  component: ReactNode,
  initState?: string,
) =>
  render(
    <Wrapper>
      <MachineProvider args={context} initState={initState}>
        <I18nextProvider i18n={configureI18next()}>
          <MissingPermissionsSheetProvider>
            <Layout>{component}</Layout>
          </MissingPermissionsSheetProvider>
        </I18nextProvider>
      </MachineProvider>
    </Wrapper>,
  );

export default renderPage;
