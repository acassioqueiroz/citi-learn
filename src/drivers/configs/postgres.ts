import { DriverError } from '@/drivers/errors/driver-error';

const POSTGRES_URI = process.env.POSTGRES_URI;
const POSTGRES_MAX_CONNECTIONS = process.env.POSTGRES_MAX_CONNECTIONS;
if (!POSTGRES_URI) {
  throw new DriverError('Missing POSTGRES_URI environment variable');
}
const postgresConfig = {
  uri: POSTGRES_URI,
  max_connections: POSTGRES_MAX_CONNECTIONS,
};
export { postgresConfig };
