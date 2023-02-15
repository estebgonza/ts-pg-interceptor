import { RequestInterceptor } from "..";
import { TcpProxy, TcpProxyOptions } from "./../../proxy";

/**
 * The options for a PostgresRequestInterceptor instance
 */
export interface PostgresRequestInterceptorOptions extends TcpProxyOptions {}

/**
 * The events emitted by a PostgresRequestInterceptor instance
 */
export interface PostgresRequestInterceptorEvents {
  request: (request: string) => void;
}

/**
 * A class that intercepts incoming Postgres requests sent through a TcpProxy instance.
 */
export class PostgresRequestInterceptor extends RequestInterceptor {
  /**
   * Creates an instance of PostgresRequestInterceptor
   * @param options - The options for the PostgresRequestInterceptor instance
   */
  constructor(options: PostgresRequestInterceptorOptions) {
    super(options);
  }

  /**
   * Handles incoming data from clients.
   * @param data - The incoming data from a client.
   */
  protected handleClientData(data: Buffer) {
    const str = data.toString().trim();
    if (str.startsWith("Q")) {
      this.emit("request", str.substring(1));
    }
  }
}

export { TcpProxyOptions, TcpProxy };
