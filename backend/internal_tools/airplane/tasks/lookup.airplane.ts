import airplane from 'airplane';
import { Client } from 'pg';

export default airplane.task(
  {
    slug: 'lookup_id',
    name: 'Lookup ID',
    parameters: {
      id: {
        name: 'Lookup a Footprint ID',
        required: true,
        default: 'org_abcd',
        type: 'shorttext',
        description: 'Extract all relevant info on id',
      },
    },
    envVars: {
      DATABASE_URL: { config: 'DATABASE_URL' },
    },
  },
  async params => {
    const dbUrl = process.env.DATABASE_URL;
    const id = params.id;

    const components = id.split('_');
    if (components.length < 2) {
      return ['invalid identifier'];
    }

    const prefix = components.slice(0, components.length - 1).join('_');
    let query: string;
    console.log('got prefix: ', prefix);

    switch (prefix) {
      case 'su':
        query = `
        SELECT * from scoped_vault
        INNER JOIN tenant on tenant.id=scoped_vault.tenant_id
        WHERE scoped_vault.id='${id}';`;
        break;
      case 'org':
        query = `SELECT * from tenant WHERE id='${id}';`;
        break;
      case 'ob_config_id':
        query = `
        SELECT * from ob_configuration WHERE id='${id}'
        INNER JOIN tenant on tenant.id=ob_configuration.tenant_id;`;
        break;
      case 'fp_id':
        query = `
        SELECT * from scoped_vault
        INNER JOIN tenant on tenant.id=scoped_vault.tenant_id
        WHERE scoped_vault.fp_id='${id}';`;
        break;
      default:
        return ['unsupported id prefix'];
    }

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
