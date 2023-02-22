import net from "net";
import {
  PostgresRequestInterceptor,
  PostgresQueryInterceptorOptions,
} from "../src/interceptor/postgres";

describe("PostgresRequestInterceptor", () => {
  let interceptor: PostgresRequestInterceptor;

  beforeEach(() => {
    const options: PostgresQueryInterceptorOptions = {
      targetHost: "localhost",
      targetPort: 3001,
      listenPort: 3002,
    };
    interceptor = new PostgresRequestInterceptor(options);
  });

  it("should return data if the string starts with a letter other than 'Q'", () => {
    const buffer = Buffer.from("P Hello World");
    const socket = new net.Socket();
    const result = interceptor.handleDataFromClient(buffer, socket);
    expect(result).toBe(buffer);
  });

  it("should call onQuery and return its result if the string starts with 'Q'", () => {
    const buffer = Buffer.from("Q SELECT * FROM users;");
    const socket = new net.Socket();
    interceptor.onQuery = jest.fn(() =>
      Buffer.from("Query executed successfully")
    );
    const result = interceptor.handleDataFromClient(buffer, socket);
    expect(interceptor.onQuery).toHaveBeenCalledWith(buffer, socket);
    expect(result).toBeInstanceOf(Buffer);
  });

  it("should call onResults and return its result", () => {
    const buffer = Buffer.from("Results from the database");
    const socket = new net.Socket();
    interceptor.onResults = jest.fn(() =>
      Buffer.from("Results intercepted successfully")
    );
    const result = interceptor.handleDataFromDatabase(buffer, socket);
    expect(interceptor.onResults).toHaveBeenCalledWith(buffer, socket);
    expect(result).toBeInstanceOf(Buffer);
  });
});
