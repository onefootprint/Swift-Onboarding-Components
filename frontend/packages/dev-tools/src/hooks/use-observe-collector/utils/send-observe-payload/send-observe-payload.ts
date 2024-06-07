const sendObservePayload = async (data: Record<string, unknown>[]) => {
  fetch(
    'https://189225732777.collect.observeinc.com/v1/http/?observe_token=ds1FFZo4VU4NEv9yYems:2b8XTbUIjt5vRarHo7bc716EXZSICoDi',
    {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ds1FFZo4VU4NEv9yYems:2b8XTbUIjt5vRarHo7bc716EXZSICoDi',
        'Content-type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(data),
      mode: 'no-cors',
      credentials: 'include',
    },
  ).catch(error => {
    console.log('Sending frontend telemetry failed: ', error); // eslint-disable-line no-console
  });
};

export default sendObservePayload;
