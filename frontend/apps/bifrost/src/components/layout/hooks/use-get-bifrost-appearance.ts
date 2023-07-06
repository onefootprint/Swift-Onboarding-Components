import { FootprintAppearance } from '@onefootprint/footprint-js';
import { useRouter } from 'next/router';
import { useBifrostMachine } from 'src/components/bifrost-machine-provider';

const getParsedApperance = (params: string) => {
  try {
    const parsed = JSON.parse(decodeURIComponent(params));
    return parsed;
  } catch (_) {
    console.warn(`Could not parse appearance rules. They will be ignored.`);
    return null;
  }
};

// Style params in url take precendence over the ob config one
const useGetBifrostAppearance = (): FootprintAppearance | undefined => {
  const [state] = useBifrostMachine();
  const { config } = state.context;

  const router = useRouter();
  const searchParams = new URLSearchParams(router.asPath);
  const fontSrc = searchParams.get('font_src') ?? undefined;
  const variables = searchParams.get('tokens') ?? undefined;
  const rules = searchParams.get('rules') ?? undefined;

  let appearance = config?.appearance;
  if (fontSrc || variables || rules) {
    appearance = {
      fontSrc,
      rules: rules ? getParsedApperance(rules) : undefined,
      variables: variables ? getParsedApperance(variables) : undefined,
    };
  }

  return appearance;
};

export default useGetBifrostAppearance;
