import { FootprintAppearance } from '@onefootprint/footprint-js';
import { useEffectOnce } from 'usehooks-ts';

import createAppearanceRules from './utils/create-appearance-rules';
import createAppearanceVariables from './utils/create-appearance-variables';
import createStyle from './utils/create-style';

const useExtendedAppearance = (appearance?: FootprintAppearance) => {
  const { fontSrc, rules, variables } = appearance || {};

  useEffectOnce(() => {
    if (fontSrc) {
      createStyle('footprint-custom-fonts', `@import url('${fontSrc}');`);
    }

    if (variables) {
      const css = createAppearanceVariables(variables);
      if (css) {
        const styles = `
          :root {
            ${css}
          }
        `;
        createStyle('footprint-variables', styles);
      }
    }

    if (rules) {
      const css = createAppearanceRules(rules);
      if (!css) return;
      createStyle('footprint-rules', css);
    }
  });
};

export default useExtendedAppearance;
