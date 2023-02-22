import { RequestInterceptor, QueryInterceptorOptions } from "..";
import { TcpProxy, TcpProxyOptions } from "../../proxy/proxy";
import type net from "net";

/**
 * The options for a PostgresRequestInterceptor instance
 */
export interface PostgresQueryInterceptorOptions
  extends QueryInterceptorOptions {}

/**
 * A class that intercepts incoming Postgres requests sent through a TcpProxy instance.
 */
export class PostgresRequestInterceptor extends RequestInterceptor {
  /**
   * Creates an instance of PostgresRequestInterceptor
   * @param options - The options for the PostgresRequestInterceptor instance
   */
  constructor(options: PostgresQueryInterceptorOptions) {
    super(options);
  }

  /**
   * Handles incoming data from clients.
   * @param data - The incoming data from a client.
   */
  public handleDataFromClient(
    data: Buffer,
    socket: net.Socket
  ): Buffer | Promise<Buffer> {
    const str = data.toString().trim();
    if (str.startsWith("Q")) {
      return this.onQuery(data, socket) || data;
    }
    return data;
  }

  /**
   * Handles incoming data from the target server.
   * @param data - The incoming data from the target server.
   * @param socket - The socket that the data was received on.
   * @returns The data to send to the client.
   */
  public handleDataFromDatabase(
    data: Buffer,
    socket: net.Socket
  ): Buffer | Promise<Buffer> {
    return this.onResults(data, socket) || data;
  }
}

export { TcpProxyOptions, TcpProxy };
