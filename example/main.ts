import { PostgresQueryInterceptor } from "ts-pg-interceptor";

const interceptor = new PostgresQueryInterceptor({
  // Interceptor server options
  host: "localhost",
  port: 6432,
  // Target Postgres connection options
  targetHost: "localhost",
  targetPort: 5432,
});

// Start the interceptor and begin intercepting incoming requests
interceptor.start();
