import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
import { join } from 'path'

dotenv.config()

const isCompiled = __filename.endsWith('.js')

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  entities: isCompiled ? [] : [join(__dirname, '..', '**', 'entities', '*.entity.ts')],
  migrations: [join(__dirname, '..', 'migrations', isCompiled ? '*.js' : '*.ts')],
  logging: process.env.NODE_ENV !== 'production',
})
