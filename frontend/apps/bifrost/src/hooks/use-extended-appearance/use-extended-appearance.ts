import { useRouter } from 'next/router';
import { useEffectOnce } from 'usehooks-ts';

import createAppearanceRules from './utils/create-appearance-rules';
import generateAppearanceVariables from './utils/create-appearance-variables';
import injectStyles from './utils/styles-helpers';

const useExtendedAppearance = () => {
  const router = useRouter();
  const searchParams = new URLSearchParams(router.asPath);

  useEffectOnce(() => {
    const tokens = searchParams.get('tokens');
    if (tokens) {
      const css = generateAppearanceVariables(tokens);
      if (css) {
        const styles = `
          :root {
            ${css}
          }
        `;
        injectStyles('footprint-variables', styles);
      }
    }
    const rules = searchParams.get('rules');
    if (rules) {
      const css = createAppearanceRules(rules);
      if (!css) return;
      injectStyles('footprint-rules', css);
    }
  });
};

export default useExtendedAppearance;
