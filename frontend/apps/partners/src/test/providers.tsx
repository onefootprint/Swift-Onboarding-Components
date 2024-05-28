import themes from '@onefootprint/design-tokens';
import { DesignSystemProvider } from '@onefootprint/ui';
import type { render as TestingLibraryRender } from '@testing-library/react';
import React from 'react';

import { initTranslations, TranslationsProvider } from '@/i18n';

type WithChildren = { children: React.ReactNode };

export const WithDesignSystem = ({ children }: WithChildren) => (
  <DesignSystemProvider theme={themes.light}>{children}</DesignSystemProvider>
);

export const withTranslations = async (
  render: typeof TestingLibraryRender,
  children: React.ReactNode,
) => {
  const lang = 'en';
  const namespaces: ['common'] = ['common'];
  const { resources } = await initTranslations(lang, namespaces);

  return render(
    <WithDesignSystem>
      <TranslationsProvider
        locale={lang}
        namespaces={namespaces}
        resources={resources}
      >
        {children}
      </TranslationsProvider>
    </WithDesignSystem>,
  );
};
