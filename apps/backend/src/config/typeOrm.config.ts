import { DataSource } from "typeorm";

export default new DataSource({
    // type: 'postgres',
    // host: 'process.env.DB_HOST',
    // port: Number(process.env.DB_PORT),
    // username: process.env.DB_USERNAME,
    // password: process.env.DB_PASSWORD,
    // database: process.env.DB_NAME,
    // synchronize: false,
    // entities: ['dist/**/entities/*.entity{.ts,.js}'],
    // migrations: ['dist/src/migrations/*{.ts,.js}'],
    // logging: true,
    type: 'postgres',
    host: 'localhost',
    port: 5433,
    username: 'postgres',
    password: 'postgres',
    database: 'pohon',
    synchronize: false,
    entities: ['dist/**/entities/*.entity{.ts,.js}'],
    migrations: ['dist/src/migrations/*{.ts,.js}'],
    logging: true,
})
