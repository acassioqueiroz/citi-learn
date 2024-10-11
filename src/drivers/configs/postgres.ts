import { DriverError } from '@/drivers/errors/driver-error';

const POSTGRES_URI = process.env.POSTGRES_URI;
if (!POSTGRES_URI) {
  throw new DriverError('Missing POSTGRES_URI environment variable');
}
const postgresConfig = {
  uri: POSTGRES_URI,
};
export { postgresConfig };
