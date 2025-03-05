// import { randomBytes } from "crypto";
// import format from "pg-format";
// import migrate from "node-pg-migrate";
// import pool from "../../src/config/db";

// const DEFAULT_OPTS = {
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: Number(process.env.DB_PORT) || 5432,
// };

// class Context {
//   roleName: string;

//   constructor(roleName: string) {
//     this.roleName = roleName;
//   }

//   static async build() {
//     const roleName = "a" + randomBytes(4).toString("hex");

//     // Connect as default user (to create role/schema)
//     await pool.connect(DEFAULT_OPTS);

//     // Create role and schema
//     await pool.query(
//       format("CREATE ROLE %I WITH LOGIN PASSWORD %L;", roleName, roleName)
//     );
//     await pool.query(
//       format("CREATE SCHEMA %I AUTHORIZATION %I;", roleName, roleName)
//     );

//     // Grant privileges on schema, tables, and sequences
//     await pool.query(
//       format("GRANT USAGE ON SCHEMA %I TO %I;", roleName, roleName)
//     );
//     await pool.query(
//       format(
//         "GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA %I TO %I;",
//         roleName,
//         roleName
//       )
//     );
//     await pool.query(
//       format(
//         "GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA %I TO %I;",
//         roleName,
//         roleName
//       )
//     );
//     await pool.query(
//       format(
//         "ALTER DEFAULT PRIVILEGES IN SCHEMA %I GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO %I;",
//         roleName,
//         roleName
//       )
//     );
//     await pool.query(
//       format(
//         "ALTER DEFAULT PRIVILEGES IN SCHEMA %I GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO %I;",
//         roleName,
//         roleName
//       )
//     );

//     // Use new role for migrations
//     const AFTERROLE_OPTS = {
//       host: process.env.DB_HOST,
//       user: roleName,
//       password: roleName,
//       database: process.env.DB_NAME,
//       port: Number(process.env.DB_PORT) || 5432,
//     };

//     await migrate({
//       schema: roleName,
//       direction: "up",
//       log: () => {},
//       noLock: true,
//       dir: "migrations",
//       migrationsTable: "migrations",
//       databaseUrl: AFTERROLE_OPTS,
//     });

//     // Close default pool and reconnect as the new role
//     await pool.close();
//     await pool.connect(AFTERROLE_OPTS);

//     return new Context(roleName);
//   }

//   async close() {
//     await pool.connect(DEFAULT_OPTS);

//     await pool.query(
//       format("DROP SCHEMA IF EXISTS %I CASCADE;", this.roleName)
//     );
//     await pool.query(format("DROP ROLE IF EXISTS %I;", this.roleName));

//     await pool.close();
//   }
// }

// export default Context;
