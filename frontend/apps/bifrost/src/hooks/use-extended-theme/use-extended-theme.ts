import { Theme } from '@onefootprint/design-tokens';
import { useRouter } from 'next/router';

const useExtendedTheme = (theme: Theme) => {
  const router = useRouter();
  const searchParams = new URLSearchParams(router.asPath);
  const tokens = searchParams.get('tokens');
  if (!tokens) return theme;
  try {
    const parsedTokens = JSON.parse(tokens);
    return {
      ...theme,
      components: {
        ...theme.components,
        bifrost: {
          ...theme.components.bifrost,
          dialog: {
            ...theme.components.bifrost.dialog,
            ...parsedTokens.dialog,
          },
        },
      },
    };
  } catch (_) {
    return theme;
  }
};

export default useExtendedTheme;
