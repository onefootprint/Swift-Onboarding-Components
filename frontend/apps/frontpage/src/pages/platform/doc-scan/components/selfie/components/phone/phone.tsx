import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Screen from './components/screen';

const Phone = () => {
  const [isSafari, setIsSafari] = useState(false);
  const phoneRef = useRef(null);
  const isPhoneInView = useInView(phoneRef, { once: true, margin: '-25%' });
  const renderScreen = () => {
    return <Screen shouldAnimate={isPhoneInView} />;
  };

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setIsSafari(/^((?!chrome|android).)*safari/i.test(navigator.userAgent));
    }
  }, []);
  return (
    <div ref={phoneRef}>
      {isPhoneInView ? (
        <motion.svg
          width="220"
          height="434.5"
          viewBox="0 0 191 377"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <mask
            id="mask0_3_75"
            style={{ maskType: 'luminance' }}
            maskUnits="userSpaceOnUse"
            x="1"
            y="0"
            width="188"
            height="377"
          >
            <path
              d="M32.55 376.2C15.66 376.2 1.91003 362.46 1.91003 345.56V30.64C1.91003 13.75 15.65 0 32.55 0H157.48C174.37 0 188.12 13.74 188.12 30.64V345.56C188.12 362.45 174.38 376.2 157.48 376.2H32.55Z"
              fill="white"
            />
          </mask>
          <g mask="url(#mask0_3_75)">
            <path
              d="M32.55 376.2C15.66 376.2 1.91003 362.46 1.91003 345.56V30.64C1.91003 13.75 15.65 0 32.55 0H157.48C174.37 0 188.12 13.74 188.12 30.64V345.56C188.12 362.45 174.38 376.2 157.48 376.2H32.55Z"
              fill="url(#paint0_linear_3_75)"
            />
          </g>
          <mask
            id="mask1_3_75"
            style={{ maskType: 'luminance' }}
            maskUnits="userSpaceOnUse"
            x="1"
            y="0"
            width="188"
            height="377"
          >
            <path
              d="M32.55 376.2C15.66 376.2 1.91003 362.46 1.91003 345.56V30.64C1.91003 13.75 15.65 0 32.55 0H157.48C174.37 0 188.12 13.74 188.12 30.64V345.56C188.12 362.45 174.38 376.2 157.48 376.2H32.55Z"
              fill="white"
            />
          </mask>
          <g mask="url(#mask1_3_75)">
            <g opacity="0.5">
              <rect x="-0.316528" y="-2.25739" width="190.8" height="380.64" fill="url(#pattern0_3_75)" />
            </g>
          </g>
          <mask
            id="mask2_3_75"
            style={{ maskType: 'luminance' }}
            maskUnits="userSpaceOnUse"
            x="1"
            y="0"
            width="188"
            height="377"
          >
            <path
              d="M32.55 376.2C15.66 376.2 1.91003 362.46 1.91003 345.56V30.64C1.91003 13.75 15.65 0 32.55 0H157.48C174.37 0 188.12 13.74 188.12 30.64V345.56C188.12 362.45 174.38 376.2 157.48 376.2H32.55Z"
              fill="white"
            />
          </mask>
          <g mask="url(#mask2_3_75)">
            <path
              d="M157.47 2.79001H32.5501C17.1701 2.79001 4.70007 15.26 4.70007 30.64V345.56C4.70007 360.94 17.1701 373.41 32.5501 373.41H157.48C172.86 373.41 185.33 360.94 185.33 345.56V30.64C185.32 15.26 172.85 2.79001 157.47 2.79001Z"
              fill="black"
            />
          </g>
          <mask
            id="mask3_3_75"
            style={{ maskType: 'luminance' }}
            maskUnits="userSpaceOnUse"
            x="1"
            y="0"
            width="188"
            height="377"
          >
            <path
              d="M32.55 376.2C15.66 376.2 1.91003 362.46 1.91003 345.56V30.64C1.91003 13.75 15.65 0 32.55 0H157.48C174.37 0 188.12 13.74 188.12 30.64V345.56C188.12 362.45 174.38 376.2 157.48 376.2H32.55Z"
              fill="white"
            />
          </mask>
          <g mask="url(#mask3_3_75)">
            <g opacity="0.5">
              <rect x="3.28345" y="1.34259" width="183.36" height="373.44" fill="url(#pattern1_3_75)" />
            </g>
          </g>
          <mask
            id="mask4_3_75"
            style={{ maskType: 'luminance' }}
            maskUnits="userSpaceOnUse"
            x="1"
            y="0"
            width="188"
            height="377"
          >
            <path
              d="M32.55 376.2C15.66 376.2 1.91003 362.46 1.91003 345.56V30.64C1.91003 13.75 15.65 0 32.55 0H157.48C174.37 0 188.12 13.74 188.12 30.64V345.56C188.12 362.45 174.38 376.2 157.48 376.2H32.55Z"
              fill="white"
            />
          </mask>
          <g mask="url(#mask4_3_75)">
            <path opacity="0.3" d="M4.70003 30.64H1.91003V33.26H4.70003V30.64Z" fill="white" />
            <path opacity="0.3" d="M188.11 30.63H185.32V33.25H188.11V30.63Z" fill="white" />
            <path opacity="0.3" d="M4.70003 342.93H1.91003V345.55H4.70003V342.93Z" fill="white" />
            <path opacity="0.3" d="M188.11 342.92H185.32V345.54H188.11V342.92Z" fill="white" />
          </g>
          <mask
            id="mask5_3_75"
            style={{ maskType: 'alpha' }}
            maskUnits="userSpaceOnUse"
            x="8"
            y="6"
            width="174"
            height="364"
          >
            <path
              d="M157.18 6.25C170.88 6.25 181.98 17.35 181.98 31.05V344.88C181.98 358.58 170.88 369.68 157.18 369.68H32.85C19.15 369.68 8.05005 358.58 8.05005 344.88V31.05C8.05005 17.35 19.15 6.25 32.85 6.25H157.18Z"
              fill="#B1B1B0"
            />
          </mask>
          <g mask="url(#mask5_3_75)">
            <foreignObject
              x={isSafari ? '12' : '8'}
              y={isSafari ? '10' : '6'}
              width={isSafari ? '196' : '174'}
              height={isSafari ? '414' : '364'}
            >
              {renderScreen()}
            </foreignObject>
          </g>
          <path
            d="M1.91 83.49H0.709991C0.319991 83.49 0 83.17 0 82.78V70.25C0 69.86 0.319991 69.54 0.709991 69.54H1.91V83.49Z"
            fill="url(#paint1_linear_3_75)"
          />
          <path
            opacity="0.7"
            d="M1.91 83.49H0.709991C0.319991 83.49 0 83.17 0 82.78V70.25C0 69.86 0.319991 69.54 0.709991 69.54H1.91V83.49Z"
            fill="url(#paint2_linear_3_75)"
          />
          <path
            d="M1.91 124.88H0.709991C0.319991 124.88 0 124.56 0 124.17V97.87C0 97.48 0.319991 97.16 0.709991 97.16H1.91V124.88Z"
            fill="url(#paint3_linear_3_75)"
          />
          <path
            opacity="0.7"
            d="M1.91 124.88H0.709991C0.319991 124.88 0 124.56 0 124.17V97.87C0 97.48 0.319991 97.16 0.709991 97.16H1.91V124.88Z"
            fill="url(#paint4_linear_3_75)"
          />
          <path
            d="M189.32 141.92H188.12V97.16H189.32C189.71 97.16 190.03 97.48 190.03 97.87V141.22C190.02 141.6 189.71 141.92 189.32 141.92Z"
            fill="url(#paint5_linear_3_75)"
          />
          <path
            opacity="0.7"
            d="M189.32 141.92H188.12V97.16H189.32C189.71 97.16 190.03 97.48 190.03 97.87V141.22C190.02 141.6 189.71 141.92 189.32 141.92Z"
            fill="url(#paint6_linear_3_75)"
          />
          <path
            d="M1.91 161.53H0.709991C0.319991 161.53 0 161.21 0 160.82V134.52C0 134.13 0.319991 133.81 0.709991 133.81H1.91V161.53Z"
            fill="url(#paint7_linear_3_75)"
          />
          <path
            opacity="0.7"
            d="M1.91 161.53H0.709991C0.319991 161.53 0 161.21 0 160.82V134.52C0 134.13 0.319991 133.81 0.709991 133.81H1.91V161.53Z"
            fill="url(#paint8_linear_3_75)"
          />
          <path
            d="M110.11 25.54H74.11C70.2 25.54 67.02 22.37 67.02 18.45C67.02 14.54 70.19 11.36 74.11 11.36H110.11C114.02 11.36 117.2 14.53 117.2 18.45C117.2 22.37 114.03 25.54 110.11 25.54Z"
            fill="black"
          />
          <defs>
            <pattern id="pattern0_3_75" patternContentUnits="objectBoundingBox" width="1" height="1">
              <use xlinkHref="#image0_3_75" transform="scale(0.00125 0.000628141)" />
            </pattern>
            <pattern id="pattern1_3_75" patternContentUnits="objectBoundingBox" width="1" height="1">
              <use xlinkHref="#image1_3_75" transform="scale(0.00130378 0.000641849)" />
            </pattern>
            <pattern id="pattern2_3_75" patternContentUnits="objectBoundingBox" width="1" height="1">
              <use xlinkHref="#image2_3_75" transform="scale(0.00209195 0.001)" />
            </pattern>
            <linearGradient
              id="paint0_linear_3_75"
              x1="102.2"
              y1="374.106"
              x2="91.0207"
              y2="-1.46104"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#404348" />
              <stop offset="0.0431" stopColor="#899099" />
              <stop offset="0.2549" stopColor="#404348" />
              <stop offset="0.8078" stopColor="#404348" />
              <stop offset="0.963542" stopColor="#838994" />
              <stop offset="1" stopColor="#404348" />
            </linearGradient>
            <linearGradient
              id="paint1_linear_3_75"
              x1="1.0287"
              y1="83.4124"
              x2="-0.454045"
              y2="69.633"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#404348" />
              <stop offset="0.0431" stopColor="#899099" />
              <stop offset="0.2549" stopColor="#404348" />
              <stop offset="0.8078" stopColor="#404348" />
              <stop offset="0.963542" stopColor="#838994" />
              <stop offset="1" stopColor="#404348" />
            </linearGradient>
            <linearGradient
              id="paint2_linear_3_75"
              x1="-0.001"
              y1="76.5193"
              x2="1.9094"
              y2="76.5193"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#777D87" stopOpacity="0" />
              <stop offset="0.2788" stopColor="#747A84" stopOpacity="0.2648" />
              <stop offset="0.5161" stopColor="#6B7079" stopOpacity="0.4903" />
              <stop offset="0.7383" stopColor="#5C6068" stopOpacity="0.7014" />
              <stop offset="0.95" stopColor="#46494F" stopOpacity="0.9025" />
              <stop offset="1" stopColor="#404348" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient
              id="paint3_linear_3_75"
              x1="1.0287"
              y1="124.726"
              x2="-4.63484"
              y2="98.2388"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#404348" />
              <stop offset="0.0431" stopColor="#899099" />
              <stop offset="0.2549" stopColor="#404348" />
              <stop offset="0.8078" stopColor="#404348" />
              <stop offset="0.963542" stopColor="#838994" />
              <stop offset="1" stopColor="#404348" />
            </linearGradient>
            <linearGradient
              id="paint4_linear_3_75"
              x1="-0.001"
              y1="111.024"
              x2="1.9094"
              y2="111.024"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#777D87" stopOpacity="0" />
              <stop offset="0.2788" stopColor="#747A84" stopOpacity="0.2648" />
              <stop offset="0.5161" stopColor="#6B7079" stopOpacity="0.4903" />
              <stop offset="0.7383" stopColor="#5C6068" stopOpacity="0.7014" />
              <stop offset="0.95" stopColor="#46494F" stopOpacity="0.9025" />
              <stop offset="1" stopColor="#404348" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient
              id="paint5_linear_3_75"
              x1="189.149"
              y1="141.671"
              x2="175.351"
              y2="101.71"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#C8DCE2" />
              <stop offset="0.0431" stopColor="#BFCEDF" />
              <stop offset="0.2549" stopColor="#A8CBD7" />
              <stop offset="0.8078" stopColor="#CDDDE2" />
              <stop offset="0.966" stopColor="#C8D4E6" />
              <stop offset="0.9845" stopColor="#D9E2F0" />
              <stop offset="1" stopColor="#E2F5F2" />
            </linearGradient>
            <linearGradient
              id="paint6_linear_3_75"
              x1="189.149"
              y1="141.671"
              x2="175.351"
              y2="101.71"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#404348" />
              <stop offset="0.0431" stopColor="#899099" />
              <stop offset="0.2549" stopColor="#404348" />
              <stop offset="0.8078" stopColor="#404348" />
              <stop offset="0.963542" stopColor="#838994" />
              <stop offset="1" stopColor="#404348" />
            </linearGradient>
            <linearGradient
              id="paint7_linear_3_75"
              x1="1.0287"
              y1="161.376"
              x2="-4.63484"
              y2="134.889"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#404348" />
              <stop offset="0.0431" stopColor="#899099" />
              <stop offset="0.2549" stopColor="#404348" />
              <stop offset="0.8078" stopColor="#404348" />
              <stop offset="0.963542" stopColor="#838994" />
              <stop offset="1" stopColor="#404348" />
            </linearGradient>
            <linearGradient
              id="paint8_linear_3_75"
              x1="-0.001"
              y1="147.674"
              x2="1.9094"
              y2="147.674"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#777D87" stopOpacity="0" />
              <stop offset="0.2788" stopColor="#747A84" stopOpacity="0.2648" />
              <stop offset="0.5161" stopColor="#6B7079" stopOpacity="0.4903" />
              <stop offset="0.7383" stopColor="#5C6068" stopOpacity="0.7014" />
              <stop offset="0.95" stopColor="#46494F" stopOpacity="0.9025" />
              <stop offset="1" stopColor="#404348" stopOpacity="0.95" />
            </linearGradient>
          </defs>
        </motion.svg>
      ) : null}
    </div>
  );
};

export default Phone;
