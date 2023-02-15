import { PostgresRequestInterceptor } from ".";
import * as net from "net";
import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";

describe("PostgresRequestInterceptor", () => {
  let interceptor: PostgresRequestInterceptor;

  beforeEach(() => {
    interceptor = new PostgresRequestInterceptor({
      targetHost: "localhost",
      targetPort: 5432,
      listenPort: 5433,
    });
  });

  afterEach(() => {
    interceptor.stop();
  });

  it("should emit on-request event", (done) => {
    interceptor.on("request", (requestData) => {
      expect(requestData).toEqual("SELECT 1");
      done();
    });

    interceptor.start();

    const client = new net.Socket();
    client.connect(5433, "localhost", () => {
      client.write("QSELECT 1");
    });
  });
});
