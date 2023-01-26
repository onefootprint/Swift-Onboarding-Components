import airplane from 'airplane';
import { Client } from 'pg';

export default airplane.task(
  {
    slug: 'dbquery',
    name: 'DB query',
    parameters: {
      query: {
        name: 'Query string',
        required: true,
        default: 'SELECT 1;',
        type: 'sql',
        description: 'a SELECT-only query string to execute',
      },
    },
    envVars: {
      DATABASE_URL: { config: 'DATABASE_URL' },
    },
  },
  async params => {
    const dbUrl = process.env.DATABASE_URL;
    const query = params.query;

    console.log(dbUrl);
    const client = new Client({
      connectionString: dbUrl,
    });
    await client.connect();

    // Run the UPDATE query
    const res = await client.query(query);

    // Close the database connection.
    await client.end();

    return res.rows;
  },
);
