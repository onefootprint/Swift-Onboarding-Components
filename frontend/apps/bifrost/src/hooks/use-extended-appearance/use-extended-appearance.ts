import { useRouter } from 'next/router';
import { useEffectOnce } from 'usehooks-ts';

import createAppearanceRules from './utils/create-appearance-rules';
import generateAppearanceVariables from './utils/create-appearance-variables';
import createStyle from './utils/create-style';

const useExtendedAppearance = () => {
  const router = useRouter();
  const searchParams = new URLSearchParams(router.asPath);

  useEffectOnce(() => {
    const fontSrc = searchParams.get('font_src');
    if (fontSrc) {
      createStyle('footprint-custom-fonts', `@import url('${fontSrc}');`);
    }

    const tokens = searchParams.get('tokens');
    if (tokens) {
      const css = generateAppearanceVariables(tokens);
      if (css) {
        const styles = `
          :root {
            ${css}
          }
        `;
        createStyle('footprint-variables', styles);
      }
    }

    const rules = searchParams.get('rules');
    if (rules) {
      const css = createAppearanceRules(rules);
      if (!css) return;
      createStyle('footprint-rules', css);
    }
  });
};

export default useExtendedAppearance;
