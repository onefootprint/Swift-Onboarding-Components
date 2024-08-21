import { media } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import ReactCountryFlag from 'react-country-flag';
import styled, { css } from 'styled-components';
import { useHover } from 'usehooks-ts';

const countries = [
  'US',
  'CN',
  'IN',
  'ID',
  'BR',
  'PK',
  'NG',
  'BD',
  'RU',
  'MX',
  'JP',
  'DE',
  'FR',
  'GB',
  'IT',
  'AR',
  'CA',
  'SA',
  'TR',
  'KR',
  'ES',
  'AU',
  'EG',
  'PL',
  'NL',
  'TH',
  'ZA',
  'PH',
  'SE',
  'CH',
  'AT',
  'NO',
  'FI',
  'DK',
  'BE',
  'CZ',
  'SK',
  'HU',
  'GR',
];

const GlobalSupport = () => {
  const countryGridRef = useRef(null);
  const isHovered = useHover(countryGridRef);

  return (
    <>
      <CountryGrid ref={countryGridRef}>
        {countries.map((country, index) => (
          <FlagContainer
            key={country}
            initial={{ scale: 1 }}
            animate={isHovered ? { scale: [1, 1.2, 1] } : { scale: 1 }}
            transition={{
              duration: 2,
              delay: index * 0.2,
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: countries.length * 0.2,
            }}
          >
            <Flag aria-label={country} countryCode={country} svg style={{ width: '2em', height: '1.5em' }} />
          </FlagContainer>
        ))}
      </CountryGrid>
    </>
  );
};

const Flag = styled(ReactCountryFlag)`
${({ theme }) => css`
    object-fit: cover;
    border-radius: ${theme.borderRadius.sm};
    overflow: hidden;
    box-shadow: ${theme.elevation[2]};
`}
`;

const CountryGrid = styled(motion.div)`
${({ theme }) => css`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    grid-auto-rows: 100px;
    gap: ${theme.spacing[3]};
    padding: ${theme.spacing[3]};
    justify-content: flex-start;
    align-items: center;
    position: relative;
    place-items: center;

    ${media.greaterThan('md')`
        max-height: none;
    `}
`}
`;

const FlagContainer = styled(motion.div)`
${({ theme }) => css`
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.full};
    width: 64px;
    height: 64px;
    box-shadow: 0px 0px 0px 8px #F5F5F5;
`}
`;

export default GlobalSupport;
