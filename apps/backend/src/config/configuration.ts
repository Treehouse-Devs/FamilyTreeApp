import { registerAs } from '@nestjs/config'

export default registerAs('config', () => ({
  env: process.env.NODE_ENV,
  deploymentEnv: process.env.DEPLOYMENT_ENV,
  db: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: process.env.NODE_ENV !== 'production',
  },
}))
