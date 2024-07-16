const ALL_COUNTRY_CODES = [
  'US',
  'AF',
  'AX',
  'AL',
  'AN',
  'DZ',
  'AS',
  'AD',
  'AO',
  'AI',
  'AG',
  'AR',
  'AM',
  'AW',
  'AU',
  'AT',
  'AZ',
  'BS',
  'BH',
  'BD',
  'BB',
  'BY',
  'BE',
  'BZ',
  'BJ',
  'BM',
  'BT',
  'BO',
  'BA',
  'BQ',
  'BW',
  'BV',
  'BR',
  'IO',
  'BN',
  'BG',
  'BF',
  'BI',
  'KH',
  'CM',
  'CA',
  'CV',
  'KY',
  'CF',
  'TD',
  'CL',
  'CN',
  'CX',
  'CC',
  'CO',
  'KM',
  'SD',
  'CG',
  'CK',
  'CR',
  'CI',
  'HR',
  'CU',
  'CW',
  'CY',
  'CZ',
  'CD',
  'DK',
  'DJ',
  'DM',
  'DO',
  'EC',
  'EG',
  'SV',
  'GQ',
  'ER',
  'EE',
  'ET',
  'FK',
  'FO',
  'FJ',
  'FI',
  'FR',
  'GF',
  'PF',
  'TF',
  'GA',
  'GM',
  'GE',
  'DE',
  'GH',
  'GI',
  'GR',
  'GL',
  'GD',
  'GP',
  'GU',
  'GT',
  'GG',
  'GN',
  'GW',
  'GY',
  'HT',
  'HM',
  'VA',
  'HN',
  'HK',
  'HU',
  'IS',
  'IN',
  'ID',
  'IR',
  'IQ',
  'IE',
  'IM',
  'IL',
  'IT',
  'JM',
  'JP',
  'JE',
  'JO',
  'KZ',
  'KE',
  'KI',
  'KW',
  'KG',
  'LA',
  'LV',
  'LB',
  'LS',
  'LR',
  'LY',
  'LI',
  'LT',
  'LU',
  'MO',
  'MG',
  'MW',
  'MY',
  'MV',
  'ML',
  'MT',
  'MH',
  'MQ',
  'MR',
  'MU',
  'YT',
  'MX',
  'FM',
  'MD',
  'MC',
  'MN',
  'ME',
  'MS',
  'MA',
  'MZ',
  'MM',
  'NA',
  'NR',
  'NP',
  'NL',
  'NC',
  'NZ',
  'NI',
  'NE',
  'NG',
  'NU',
  'NF',
  'MP',
  'NO',
  'OM',
  'PK',
  'PW',
  'PS',
  'PA',
  'PG',
  'PY',
  'PE',
  'PH',
  'PN',
  'PL',
  'PT',
  'PR',
  'QA',
  'MK',
  'RE',
  'RO',
  'RU',
  'RW',
  'BL',
  'SH',
  'KN',
  'LC',
  'MF',
  'PM',
  'VC',
  'WS',
  'SM',
  'ST',
  'SA',
  'SN',
  'RS',
  'SC',
  'SL',
  'SG',
  'SX',
  'SK',
  'SI',
  'SB',
  'SO',
  'ZA',
  'GS',
  'KR',
  'SS',
  'ES',
  'LK',
  'SR',
  'SJ',
  'SZ',
  'SE',
  'CH',
  'SY',
  'TW',
  'TJ',
  'TZ',
  'TH',
  'TL',
  'TG',
  'TK',
  'TO',
  'TT',
  'TN',
  'TR',
  'TM',
  'TC',
  'TV',
  'UG',
  'UA',
  'AE',
  'GB',
  'UM',
  'UY',
  'UZ',
  'VU',
  'VE',
  'VN',
  'VI',
  'VG',
  'WF',
  'EH',
  'YE',
  'ZM',
  'ZW',
] as const;

type CountryCodeTuple = typeof ALL_COUNTRY_CODES;
export type CountryCode = CountryCodeTuple[number];

export const isCountryCode = (value: string): value is CountryCode => ALL_COUNTRY_CODES.includes(value as CountryCode);

export type CountryCode3 =
  | 'USA'
  | 'AFG'
  | 'ALA'
  | 'ALB'
  | 'DZA'
  | 'ASM'
  | 'AND'
  | 'AGO'
  | 'AIA'
  | 'ANT'
  | 'ATG'
  | 'ARG'
  | 'ARM'
  | 'ABW'
  | 'AUS'
  | 'AUT'
  | 'AZE'
  | 'BHS'
  | 'BHR'
  | 'BGD'
  | 'BRB'
  | 'BLR'
  | 'BEL'
  | 'BES'
  | 'BLZ'
  | 'BEN'
  | 'BMU'
  | 'BTN'
  | 'BOL'
  | 'BIH'
  | 'BWA'
  | 'BVT'
  | 'BRA'
  | 'IOT'
  | 'BRN'
  | 'BGR'
  | 'BFA'
  | 'BDI'
  | 'KHM'
  | 'CMR'
  | 'CAN'
  | 'SDN'
  | 'CPV'
  | 'CYM'
  | 'CAF'
  | 'TCD'
  | 'CHL'
  | 'CHN'
  | 'CXR'
  | 'CCK'
  | 'COL'
  | 'COM'
  | 'COG'
  | 'COK'
  | 'CRI'
  | 'CIV'
  | 'HRV'
  | 'CUB'
  | 'CUW'
  | 'CYP'
  | 'CZE'
  | 'COD'
  | 'DNK'
  | 'DJI'
  | 'DMA'
  | 'DOM'
  | 'ECU'
  | 'EGY'
  | 'SLV'
  | 'GNQ'
  | 'ERI'
  | 'EST'
  | 'ETH'
  | 'FLK'
  | 'FRO'
  | 'FJI'
  | 'FIN'
  | 'FRA'
  | 'GUF'
  | 'PYF'
  | 'ATF'
  | 'GAB'
  | 'GMB'
  | 'GEO'
  | 'DEU'
  | 'GHA'
  | 'GIB'
  | 'GRC'
  | 'GRL'
  | 'GRD'
  | 'GLP'
  | 'GUM'
  | 'GTM'
  | 'GGY'
  | 'GIN'
  | 'GNB'
  | 'GUY'
  | 'HTI'
  | 'HMD'
  | 'VAT'
  | 'HND'
  | 'HKG'
  | 'HUN'
  | 'ISL'
  | 'IND'
  | 'IDN'
  | 'IRN'
  | 'IRQ'
  | 'IRL'
  | 'IMN'
  | 'ISR'
  | 'ITA'
  | 'JAM'
  | 'JPN'
  | 'JEY'
  | 'JOR'
  | 'KAZ'
  | 'KEN'
  | 'KIR'
  | 'KWT'
  | 'KGZ'
  | 'LAO'
  | 'LVA'
  | 'LBN'
  | 'LSO'
  | 'LBR'
  | 'LBY'
  | 'LIE'
  | 'LTU'
  | 'LUX'
  | 'MAC'
  | 'MDG'
  | 'MWI'
  | 'MYS'
  | 'MDV'
  | 'MLI'
  | 'MLT'
  | 'MHL'
  | 'MTQ'
  | 'MRT'
  | 'MUS'
  | 'MYT'
  | 'MEX'
  | 'FSM'
  | 'MDA'
  | 'MCO'
  | 'MNG'
  | 'MNE'
  | 'MSR'
  | 'MAR'
  | 'MOZ'
  | 'MMR'
  | 'NAM'
  | 'NRU'
  | 'NPL'
  | 'NLD'
  | 'NCL'
  | 'NZL'
  | 'NIC'
  | 'NER'
  | 'NGA'
  | 'NIU'
  | 'NFK'
  | 'MNP'
  | 'NOR'
  | 'OMN'
  | 'PAK'
  | 'PLW'
  | 'PSE'
  | 'PAN'
  | 'PNG'
  | 'PRY'
  | 'PER'
  | 'PHL'
  | 'PCN'
  | 'POL'
  | 'PRT'
  | 'PRI'
  | 'QAT'
  | 'MKD'
  | 'REU'
  | 'ROU'
  | 'RUS'
  | 'RWA'
  | 'BLM'
  | 'SHN'
  | 'KNA'
  | 'LCA'
  | 'MAF'
  | 'SPM'
  | 'VCT'
  | 'WSM'
  | 'SMR'
  | 'STP'
  | 'SAU'
  | 'SEN'
  | 'SRB'
  | 'SYC'
  | 'SLE'
  | 'SGP'
  | 'SXM'
  | 'SVK'
  | 'SVN'
  | 'SLB'
  | 'SOM'
  | 'ZAF'
  | 'SGS'
  | 'KOR'
  | 'SSD'
  | 'ESP'
  | 'LKA'
  | 'SUR'
  | 'SJM'
  | 'SWZ'
  | 'SWE'
  | 'CHE'
  | 'SYR'
  | 'TWN'
  | 'TJK'
  | 'TZA'
  | 'THA'
  | 'TLS'
  | 'TGO'
  | 'TKL'
  | 'TON'
  | 'TTO'
  | 'TUN'
  | 'TUR'
  | 'TKM'
  | 'TCA'
  | 'TUV'
  | 'UGA'
  | 'UKR'
  | 'ARE'
  | 'GBR'
  | 'UMI'
  | 'URY'
  | 'UZB'
  | 'VUT'
  | 'VEN'
  | 'VNM'
  | 'VIR'
  | 'VGB'
  | 'WLF'
  | 'ESH'
  | 'YEM'
  | 'ZMB'
  | 'ZWE';
