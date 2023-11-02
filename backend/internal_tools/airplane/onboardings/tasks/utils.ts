export async function protected_custodian_api_call(
  authToken,
  apiUrl,
  path,
  params,
) {
  try {
    const { data } = await axios.post(`${apiUrl}/${path}`, params, {
      headers: {
        'X-Fp-Protected-Custodian-Key': authToken,
      },
    });

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw `Failed with status ${error.response?.status}: ${error.response?.statusText}`;
    } else {
      throw error;
    }
  }
}

export async function pg_query(dbUrl, query) {
  // TODO: pooling in future
  const client = new Client({
    connectionString: dbUrl,
  });
  await client.connect();
  const res = await client.query(query);
  await client.end();

  return res.rows;
}

export const tenant_name_to_emoji = new Map([
  ['findigs.com', ':findigs:'],
  ['Flexcar', ':flexcar:'],
  ['Coba', ':coba:'],
  ['Composer', ':composer:'],
  ['Fractional', ':fractional:'],
  ['Basic Capital', ':basic-capital:'],
  ['Trayd', ':trayd:'],
  ['Footprint Live', ':footprint:'],
  ['Bloom', ':bloom:'],
]);

export function rows_to_message(rows) {
  let cols = [
    // 'completed_at',
    'tenant_name',
    // 'tenant_id',
    'fp_id',
    'status',
    'assume',
    'user_dash',
    'inc_link',
    'bad_rs',
    'doc_failure_reasons',
    'document_type',
  ];

  function fieldString(col, value) {
    if (value === null) {
      return '';
    }
    if (col === 'assume') {
      return `(<${value}|assume>)`;
    } else if (col === 'user_dash') {
      return `(<${value}|user_dash>)`;
    } else if (col === 'inc_link') {
      return `(<${value}|inc_link>)`;
    } else if (col === 'bad_rs' || col === 'latest_failure_reasons') {
      return `[${value}]`;
    } else if (col === 'status') {
      let emoji = '';
      if (value == 'pass') {
        emoji = ':white_check_mark: ';
      } else if (value == 'fail') {
        emoji = ':x: ';
      }
      return `${emoji}*${value}*`;
    } else if (col === 'tenant_name') {
      let emoji = tenant_name_to_emoji.get(value) ?? '';
      return `${emoji} ${value}`;
    } else {
      return `${value}`;
    }
  }

  const message = `* ${
    rows.length
  } Onboardings in past 5min* (showing first 30)\n${cols
    .map(c => `_${c}_`)
    .join(' | ')}\n${rows
    .slice(0, 30) // only show first 30 so we don't barf too hard on Slack
    .map(e => cols.map(c => fieldString(c, e[c])).join(' | '))
    .join('\n')}`;
  return message;
}

export function pad(s, n = 18) {
  if (s == null) {
    s = '';
  }
  let o = '';
  for (let i = 0; i < Math.ceil((n - s.length) / 2.0); i++) {
    o += ' ';
  }
  o += s;
  for (let i = 0; i < Math.floor((n - s.length) / 2.0); i++) {
    o += ' ';
  }
  return o;
}
