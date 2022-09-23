import { CountryCode, CountryCode3 } from 'types';

export type CountryRecord = {
  value: CountryCode;
  value3: CountryCode3;
  label: string;
};

export const COUNTRIES: CountryRecord[] = [
  {
    value: 'US',
    label: 'United States',
    value3: 'USA',
  },
  {
    value: 'AF',
    label: 'Afghanistan',
    value3: 'AFG',
  },
  {
    value: 'AX',
    value3: 'ALA',
    label: 'Aland Islands',
  },
  {
    value: 'AL',
    label: 'Albania',
    value3: 'ALB',
  },
  {
    value: 'DZ',
    label: 'Algeria',
    value3: 'DZA',
  },
  {
    value: 'AS',
    label: 'American Samoa',
    value3: 'ASM',
  },
  {
    value: 'AD',
    label: 'Andorra',
    value3: 'AND',
  },
  {
    value: 'AO',
    label: 'Angola',
    value3: 'AGO',
  },
  {
    value: 'AI',
    label: 'Anguilla',
    value3: 'AIA',
  },
  {
    value: 'AG',
    label: 'Antigua And Barbuda',
    value3: 'ATG',
  },
  {
    value: 'AR',
    label: 'Argentina',
    value3: 'ARG',
  },
  {
    value: 'AM',
    label: 'Armenia',
    value3: 'ARM',
  },
  {
    value: 'AW',
    label: 'Aruba',
    value3: 'ABW',
  },
  {
    value: 'AU',
    label: 'Australia',
    value3: 'AUS',
  },
  {
    value: 'AT',
    label: 'Austria',
    value3: 'AUT',
  },
  {
    value: 'AZ',
    label: 'Azerbaijan',
    value3: 'AZE',
  },
  {
    value: 'BS',
    label: 'Bahamas',
    value3: 'BHS',
  },
  {
    value: 'BH',
    label: 'Bahrain',
    value3: 'BHR',
  },
  {
    value: 'BD',
    label: 'Bangladesh',
    value3: 'BGD',
  },
  {
    value: 'BB',
    label: 'Barbados',
    value3: 'BRB',
  },
  {
    value: 'BY',
    label: 'Belarus',
    value3: 'BLR',
  },
  {
    value: 'BE',
    label: 'Belgium',
    value3: 'BEL',
  },
  {
    value: 'BZ',
    label: 'Belize',
    value3: 'BLZ',
  },
  {
    value: 'BJ',
    label: 'Benin',
    value3: 'BEN',
  },
  {
    value: 'BM',
    label: 'Bermuda',
    value3: 'BMU',
  },
  {
    value: 'BT',
    label: 'Bhutan',
    value3: 'BTN',
  },
  {
    value: 'BO',
    label: 'Bolivia',
    value3: 'BOL',
  },
  {
    value: 'BA',
    label: 'Bosnia And Herzegovina',
    value3: 'BIH',
  },
  {
    value: 'BW',
    label: 'Botswana',
    value3: 'BWA',
  },
  {
    value: 'BV',
    label: 'Bouvet Island',
    value3: 'BVT',
  },
  {
    value: 'BR',
    label: 'Brazil',
    value3: 'BRA',
  },
  {
    value: 'IO',
    label: 'British Indian Ocean Territory',
    value3: 'IOT',
  },
  {
    value: 'BN',
    label: 'Brunei Darussalam',
    value3: 'BRN',
  },
  {
    value: 'BG',
    label: 'Bulgaria',
    value3: 'BGR',
  },
  {
    value: 'BF',
    label: 'Burkina Faso',
    value3: 'BFA',
  },
  {
    value: 'BI',
    label: 'Burundi',
    value3: 'BDI',
  },
  {
    value: 'KH',
    label: 'Cambodia',
    value3: 'KHM',
  },
  {
    value: 'CM',
    label: 'Cameroon',
    value3: 'CMR',
  },
  {
    value: 'CA',
    label: 'Canada',
    value3: 'CAN',
  },
  {
    value: 'CV',
    label: 'Cape Verde',
    value3: 'CPV',
  },
  {
    value: 'KY',
    label: 'Cayman Islands',
    value3: 'CYM',
  },
  {
    value: 'CF',
    label: 'Central African Republic',
    value3: 'CAF',
  },
  {
    value: 'TD',
    label: 'Chad',
    value3: 'TCD',
  },
  {
    value: 'CL',
    label: 'Chile',
    value3: 'CHL',
  },
  {
    value: 'CN',
    label: 'China',
    value3: 'CHN',
  },
  {
    value: 'CX',
    label: 'Christmas Island',
    value3: 'CXR',
  },
  {
    value: 'CC',
    label: 'Cocos Keeling Islands',
    value3: 'CCK',
  },
  {
    value: 'CO',
    label: 'Colombia',
    value3: 'COL',
  },
  {
    value: 'KM',
    label: 'Comoros',
    value3: 'COM',
  },
  {
    value: 'CG',
    label: 'Congo',
    value3: 'COG',
  },
  {
    value: 'CK',
    label: 'Cook Islands',
    value3: 'COK',
  },
  {
    value: 'CR',
    label: 'Costa Rica',
    value3: 'CRI',
  },
  {
    value: 'CI',
    label: "Côte d'Ivoire",
    value3: 'CIV',
  },
  {
    value: 'HR',
    label: 'Croatia',
    value3: 'HRV',
  },
  {
    value: 'CU',
    label: 'Cuba',
    value3: 'CUB',
  },
  {
    value: 'CW',
    label: 'Curaçao',
    value3: 'CUW',
  },
  {
    value: 'CY',
    label: 'Cyprus',
    value3: 'CYP',
  },
  {
    value: 'CZ',
    label: 'Czech Republic',
    value3: 'CZE',
  },
  {
    value: 'CD',
    label: 'Democratic Republic of the Congo',
    value3: 'COD',
  },
  {
    value: 'DK',
    label: 'Denmark',
    value3: 'DNK',
  },
  {
    value: 'DJ',
    label: 'Djibouti',
    value3: 'DJI',
  },
  {
    value: 'DM',
    label: 'Dominica',
    value3: 'DMA',
  },
  {
    value: 'DO',
    label: 'Dominican Republic',
    value3: 'DOM',
  },
  {
    value: 'EC',
    label: 'Ecuador',
    value3: 'ECU',
  },
  {
    value: 'EG',
    label: 'Egypt',
    value3: 'EGY',
  },
  {
    value: 'SV',
    label: 'El Salvador',
    value3: 'SLV',
  },
  {
    value: 'GQ',
    label: 'Equatorial Guinea',
    value3: 'GNQ',
  },
  {
    value: 'ER',
    label: 'Eritrea',
    value3: 'ERI',
  },
  {
    value: 'EE',
    label: 'Estonia',
    value3: 'EST',
  },
  {
    value: 'ET',
    label: 'Ethiopia',
    value3: 'ETH',
  },
  {
    value: 'FK',
    label: 'Falkland Islands (Malvinas)',
    value3: 'FLK',
  },
  {
    value: 'FO',
    label: 'Faroe Islands',
    value3: 'FRO',
  },
  {
    value: 'FJ',
    label: 'Fiji',
    value3: 'FJI',
  },
  {
    value: 'FI',
    label: 'Finland',
    value3: 'FIN',
  },
  {
    value: 'FR',
    label: 'France',
    value3: 'FRA',
  },
  {
    value: 'GF',
    label: 'French Guiana',
    value3: 'GUF',
  },
  {
    value: 'PF',
    label: 'French Polynesia',
    value3: 'PYF',
  },
  {
    value: 'TF',
    label: 'French Southern Territories',
    value3: 'ATF',
  },
  {
    value: 'GA',
    label: 'Gabon',
    value3: 'GAB',
  },
  {
    value: 'GM',
    label: 'Gambia',
    value3: 'GMB',
  },
  {
    value: 'GE',
    label: 'Georgia',
    value3: 'GEO',
  },
  {
    value: 'DE',
    label: 'Germany',
    value3: 'DEU',
  },
  {
    value: 'GH',
    label: 'Ghana',
    value3: 'GHA',
  },
  {
    value: 'GI',
    label: 'Gibraltar',
    value3: 'GIB',
  },
  {
    value: 'GR',
    label: 'Greece',
    value3: 'GRC',
  },
  {
    value: 'GL',
    label: 'Greenland',
    value3: 'GRL',
  },
  {
    value: 'GD',
    label: 'Grenada',
    value3: 'GRD',
  },
  {
    value: 'GP',
    label: 'Guadeloupe',
    value3: 'GLP',
  },
  {
    value: 'GU',
    label: 'Guam',
    value3: 'GUM',
  },
  {
    value: 'GT',
    label: 'Guatemala',
    value3: 'GTM',
  },
  {
    value: 'GG',
    label: 'Guernsey',
    value3: 'GGY',
  },
  {
    value: 'GN',
    label: 'Guinea',
    value3: 'GIN',
  },
  {
    value: 'GW',
    label: 'Guinea-Bissau',
    value3: 'GNB',
  },
  {
    value: 'GY',
    label: 'Guyana',
    value3: 'GUY',
  },
  {
    value: 'HT',
    label: 'Haiti',
    value3: 'HTI',
  },
  {
    value: 'HM',
    label: 'Heard Island Mcdonald Islands',
    value3: 'HMD',
  },
  {
    value: 'VA',
    label: 'Holy See Vatican City State',
    value3: 'VAT',
  },
  {
    value: 'HN',
    label: 'Honduras',
    value3: 'HND',
  },
  {
    value: 'HK',
    label: 'Hong Kong',
    value3: 'HKG',
  },
  {
    value: 'HU',
    label: 'Hungary',
    value3: 'HUN',
  },
  {
    value: 'IS',
    label: 'Iceland',
    value3: 'ISL',
  },
  {
    value: 'IN',
    label: 'India',
    value3: 'IND',
  },
  {
    value: 'ID',
    label: 'Indonesia',
    value3: 'IDN',
  },
  {
    value: 'IR',
    label: 'Iran',
    value3: 'IRN',
  },
  {
    value: 'IQ',
    label: 'Iraq',
    value3: 'IRQ',
  },
  {
    value: 'IE',
    label: 'Ireland',
    value3: 'IRL',
  },
  {
    value: 'IM',
    label: 'Isle Of Man',
    value3: 'IMN',
  },
  {
    value: 'IL',
    label: 'Israel',
    value3: 'ISR',
  },
  {
    value: 'IT',
    label: 'Italy',
    value3: 'ITA',
  },
  {
    value: 'JM',
    label: 'Jamaica',
    value3: 'JAM',
  },
  {
    value: 'JP',
    label: 'Japan',
    value3: 'JPN',
  },
  {
    value: 'JE',
    label: 'Jersey',
    value3: 'JEY',
  },
  {
    value: 'JO',
    label: 'Jordan',
    value3: 'JOR',
  },
  {
    value: 'KZ',
    label: 'Kazakhstan',
    value3: 'KAZ',
  },
  {
    value: 'KE',
    label: 'Kenya',
    value3: 'KEN',
  },
  {
    value: 'KI',
    label: 'Kiribati',
    value3: 'KIR',
  },
  {
    value: 'KW',
    label: 'Kuwait',
    value3: 'KWT',
  },
  {
    value: 'KG',
    label: 'Kyrgyzstan',
    value3: 'KGZ',
  },
  {
    value: 'LA',
    label: "Lao People's Democratic Republic",
    value3: 'LAO',
  },
  {
    value: 'LV',
    label: 'Latvia',
    value3: 'LVA',
  },
  {
    value: 'LB',
    label: 'Lebanon',
    value3: 'LBN',
  },
  {
    value: 'LS',
    label: 'Lesotho',
    value3: 'LSO',
  },
  {
    value: 'LR',
    label: 'Liberia',
    value3: 'LBR',
  },
  {
    value: 'LY',
    label: 'Libyan Arab Jamahiriya',
    value3: 'LBY',
  },
  {
    value: 'LI',
    label: 'Liechtenstein',
    value3: 'LIE',
  },
  {
    value: 'LT',
    label: 'Lithuania',
    value3: 'LTU',
  },
  {
    value: 'LU',
    label: 'Luxembourg',
    value3: 'LUX',
  },
  {
    value: 'MO',
    label: 'Macao',
    value3: 'MAC',
  },
  {
    value: 'MG',
    label: 'Madagascar',
    value3: 'MDG',
  },
  {
    value: 'MW',
    label: 'Malawi',
    value3: 'MWI',
  },
  {
    value: 'MY',
    label: 'Malaysia',
    value3: 'MYS',
  },
  {
    value: 'MV',
    label: 'Maldives',
    value3: 'MDV',
  },
  {
    value: 'ML',
    label: 'Mali',
    value3: 'MLI',
  },
  {
    value: 'MT',
    label: 'Malta',
    value3: 'MLT',
  },
  {
    value: 'MH',
    label: 'Marshall Islands',
    value3: 'MHL',
  },
  {
    value: 'MQ',
    label: 'Martinique',
    value3: 'MTQ',
  },
  {
    value: 'MR',
    label: 'Mauritania',
    value3: 'MRT',
  },
  {
    value: 'MU',
    label: 'Mauritius',
    value3: 'MUS',
  },
  {
    value: 'YT',
    label: 'Mayotte',
    value3: 'MYT',
  },
  {
    value: 'MX',
    label: 'Mexico',
    value3: 'MEX',
  },
  {
    value: 'FM',
    label: 'Micronesia, Federated States of',
    value3: 'FSM',
  },
  {
    value: 'MD',
    label: 'Moldova',
    value3: 'MDA',
  },
  {
    value: 'MC',
    label: 'Monaco',
    value3: 'MCO',
  },
  {
    value: 'MN',
    label: 'Mongolia',
    value3: 'MNG',
  },
  {
    value: 'ME',
    label: 'Montenegro',
    value3: 'MNE',
  },
  {
    value: 'MS',
    label: 'Montserrat',
    value3: 'MSR',
  },
  {
    value: 'MA',
    label: 'Morocco',
    value3: 'MAR',
  },
  {
    value: 'MZ',
    label: 'Mozambique',
    value3: 'MOZ',
  },
  {
    value: 'MM',
    label: 'Myanmar',
    value3: 'MMR',
  },
  {
    value: 'NA',
    label: 'Namibia',
    value3: 'NAM',
  },
  {
    value: 'NR',
    label: 'Nauru',
    value3: 'NRU',
  },
  {
    value: 'NP',
    label: 'Nepal',
    value3: 'NPL',
  },
  {
    value: 'NL',
    label: 'Netherlands',
    value3: 'NLD',
  },
  {
    value: 'NC',
    label: 'New Caledonia',
    value3: 'NCL',
  },
  {
    value: 'NZ',
    label: 'New Zealand',
    value3: 'NZL',
  },
  {
    value: 'NI',
    label: 'Nicaragua',
    value3: 'NIC',
  },
  {
    value: 'NE',
    label: 'Niger',
    value3: 'NER',
  },
  {
    value: 'NG',
    label: 'Nigeria',
    value3: 'NGA',
  },
  {
    value: 'NU',
    label: 'Niue',
    value3: 'NIU',
  },
  {
    value: 'NF',
    label: 'Norfolk Island',
    value3: 'NFK',
  },
  {
    value: 'MP',
    label: 'Northern Mariana Islands',
    value3: 'MNP',
  },
  {
    value: 'NO',
    label: 'Norway',
    value3: 'NOR',
  },
  {
    value: 'OM',
    label: 'Oman',
    value3: 'OMN',
  },
  {
    value: 'PK',
    label: 'Pakistan',
    value3: 'PAK',
  },
  {
    value: 'PW',
    label: 'Palau',
    value3: 'PLW',
  },
  {
    value: 'PS',
    label: 'Palestinian Territory',
    value3: 'PSE',
  },
  {
    value: 'PA',
    label: 'Panama',
    value3: 'PAN',
  },
  {
    value: 'PG',
    label: 'Papua New Guinea',
    value3: 'PNG',
  },
  {
    value: 'PY',
    label: 'Paraguay',
    value3: 'PRY',
  },
  {
    value: 'PE',
    label: 'Peru',
    value3: 'PER',
  },
  {
    value: 'PH',
    label: 'Philippines',
    value3: 'PHL',
  },
  {
    value: 'PN',
    label: 'Pitcairn',
    value3: 'PCN',
  },
  {
    value: 'PL',
    label: 'Poland',
    value3: 'POL',
  },
  {
    value: 'PT',
    label: 'Portugal',
    value3: 'PRT',
  },
  {
    value: 'PR',
    label: 'Puerto Rico',
    value3: 'PRI',
  },
  {
    value: 'QA',
    label: 'Qatar',
    value3: 'QAT',
  },
  {
    value: 'MK',
    label: 'Republic of Macedonia',
    value3: 'MKD',
  },
  {
    value: 'RE',
    label: 'Reunion',
    value3: 'REU',
  },
  {
    value: 'RO',
    label: 'Romania',
    value3: 'ROU',
  },
  {
    value: 'RU',
    label: 'Russia',
    value3: 'RUS',
  },
  {
    value: 'RW',
    label: 'Rwanda',
    value3: 'RWA',
  },
  {
    value: 'BL',
    label: 'Saint Barthelemy',
    value3: 'BLM',
  },
  {
    value: 'SH',
    label: 'Saint Helena',
    value3: 'SHN',
  },
  {
    value: 'KN',
    label: 'Saint Kitts And Nevis',
    value3: 'KNA',
  },
  {
    value: 'LC',
    label: 'Saint Lucia',
    value3: 'LCA',
  },
  {
    value: 'MF',
    label: 'Saint Martin',
    value3: 'MAF',
  },
  {
    value: 'PM',
    label: 'Saint Pierre And Miquelon',
    value3: 'SPM',
  },
  {
    value: 'VC',
    label: 'Saint Vincent And Grenadines',
    value3: 'VCT',
  },
  {
    value: 'WS',
    label: 'Samoa',
    value3: 'WSM',
  },
  {
    value: 'SM',
    label: 'San Marino',
    value3: 'SMR',
  },
  {
    value: 'ST',
    label: 'Sao Tome And Principe',
    value3: 'STP',
  },
  {
    value: 'SA',
    label: 'Saudi Arabia',
    value3: 'SAU',
  },
  {
    value: 'SN',
    label: 'Senegal',
    value3: 'SEN',
  },
  {
    value: 'RS',
    label: 'Serbia',
    value3: 'SRB',
  },
  {
    value: 'SC',
    label: 'Seychelles',
    value3: 'SYC',
  },
  {
    value: 'SL',
    label: 'Sierra Leone',
    value3: 'SLE',
  },
  {
    value: 'SG',
    label: 'Singapore',
    value3: 'SGP',
  },
  {
    value: 'SX',
    label: 'Sint Maarten',
    value3: 'SXM',
  },
  {
    value: 'SK',
    label: 'Slovakia',
    value3: 'SVK',
  },
  {
    value: 'SI',
    label: 'Slovenia',
    value3: 'SVN',
  },
  {
    value: 'SB',
    label: 'Solomon Islands',
    value3: 'SLB',
  },
  {
    value: 'SO',
    label: 'Somalia',
    value3: 'SOM',
  },
  {
    value: 'ZA',
    label: 'South Africa',
    value3: 'ZAF',
  },
  {
    value: 'GS',
    label: 'South Georgia And Sandwich Isl',
    value3: 'SGS',
  },
  {
    value: 'KR',
    label: 'South Korea',
    value3: 'KOR',
  },
  {
    value: 'SS',
    label: 'South Sudan',
    value3: 'SSD',
  },
  {
    value: 'ES',
    label: 'Spain',
    value3: 'ESP',
  },
  {
    value: 'LK',
    label: 'Sri Lanka',
    value3: 'LKA',
  },
  {
    value: 'SR',
    label: 'Suriname',
    value3: 'SUR',
  },
  {
    value: 'SJ',
    label: 'Svalbard And Jan Mayen',
    value3: 'SJM',
  },
  {
    value: 'SZ',
    label: 'Swaziland',
    value3: 'SWZ',
  },
  {
    value: 'SE',
    label: 'Sweden',
    value3: 'SWE',
  },
  {
    value: 'CH',
    label: 'Switzerland',
    value3: 'CHE',
  },
  {
    value: 'SY',
    label: 'Syrian Arab Republic',
    value3: 'SYR',
  },
  {
    value: 'TW',
    label: 'Taiwan',
    value3: 'TWN',
  },
  {
    value: 'TJ',
    label: 'Tajikistan',
    value3: 'TJK',
  },
  {
    value: 'TZ',
    label: 'Tanzania',
    value3: 'TZA',
  },
  {
    value: 'TH',
    label: 'Thailand',
    value3: 'THA',
  },
  {
    value: 'TL',
    label: 'Timor Leste',
    value3: 'TLS',
  },
  {
    value: 'TG',
    label: 'Togo',
    value3: 'TGO',
  },
  {
    value: 'TK',
    label: 'Tokelau',
    value3: 'TKL',
  },
  {
    value: 'TO',
    label: 'Tonga',
    value3: 'TON',
  },
  {
    value: 'TT',
    label: 'Trinidad And Tobago',
    value3: 'TTO',
  },
  {
    value: 'TN',
    label: 'Tunisia',
    value3: 'TUN',
  },
  {
    value: 'TR',
    label: 'Turkey',
    value3: 'TUR',
  },
  {
    value: 'TM',
    label: 'Turkmenistan',
    value3: 'TKM',
  },
  {
    value: 'TC',
    label: 'Turks And Caicos Islands',
    value3: 'TCA',
  },
  {
    value: 'TV',
    label: 'Tuvalu',
    value3: 'TUV',
  },
  {
    value: 'UG',
    label: 'Uganda',
    value3: 'UGA',
  },
  {
    value: 'UA',
    label: 'Ukraine',
    value3: 'UKR',
  },
  {
    value: 'AE',
    label: 'United Arab Emirates',
    value3: 'ARE',
  },
  {
    value: 'GB',
    label: 'United Kingdom',
    value3: 'GBR',
  },
  {
    value: 'UM',
    label: 'United States Outlying Islands',
    value3: 'UMI',
  },
  {
    value: 'UY',
    label: 'Uruguay',
    value3: 'URY',
  },
  {
    value: 'UZ',
    label: 'Uzbekistan',
    value3: 'UZB',
  },
  {
    value: 'VU',
    label: 'Vanuatu',
    value3: 'VUT',
  },
  {
    value: 'VE',
    label: 'Venezuela',
    value3: 'VEN',
  },
  {
    value: 'VN',
    label: 'Viet Nam',
    value3: 'VNM',
  },
  {
    value: 'VI',
    label: 'Virgin Islands',
    value3: 'VIR',
  },
  {
    value: 'VG',
    label: 'Virgin Islands British',
    value3: 'VGB',
  },
  {
    value: 'WF',
    label: 'Wallis And Futuna',
    value3: 'WLF',
  },
  {
    value: 'EH',
    label: 'Western Sahara',
    value3: 'ESH',
  },
  {
    value: 'YE',
    label: 'Yemen',
    value3: 'YEM',
  },
  {
    value: 'ZM',
    label: 'Zambia',
    value3: 'ZMB',
  },
  {
    value: 'ZW',
    label: 'Zimbabwe',
    value3: 'ZWE',
  },
];

export const [DEFAULT_COUNTRY] = COUNTRIES;

export const BANNED_COUNTRIES = [];
