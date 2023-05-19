# PostgreSQL Request Interceptor

![alt text](https://img.shields.io/github/actions/workflow/status/estebgonza/ts-pg-interceptor/tests.yml?branch=main&label=Build)

A TCP proxy server with the ability to intercept and manipulate PostgreSQL requests. This package provides an event-driven approach to data handling, making it easy to listen for and modify incoming requests.

## Create an interceptor instance

----------------

```ts
// Create a new PostgresQueryInterceptor instance with the desired options
const interceptor = new PostgresQueryInterceptor({
  // Interceptor server options
  listenPort: 6432,
  // Target Postgres connection options
  targetHost: 'localhost',
  targetPort: 5432
});

// Start the interceptor and begin intercepting incoming requests
interceptor.start()
```

## Modify incoming requests

----------------

```ts
interceptor.onQuery = (query: Buffer, socket: net.Socket) => {
    const modifiedQuery = query
    // Your logic to modify the query as desired
    // Use the socket as needed to manage the connection
    // The returned query will be sent to the target Postgres server
    return modifiedQuery
}
```

## Modify outgoing results

----------------

```ts
interceptor.onResult = (result: Buffer, socket: net.Socket) => {
    const modifiedResult = result
    // Your logic to modify the result as desired
    // Use the socket as needed to manage the connection
    // The returned result will be sent to the client
    return modifiedResult
}
```

## Stop the interceptor

----------------

```ts
interceptor.stop()
```
