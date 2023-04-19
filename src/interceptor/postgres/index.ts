import { QueryInterceptor, QueryInterceptorOptions } from "../index.js";
import { TcpProxy, TcpProxyOptions } from "../../proxy/proxy.js";
import * as net from "net";

/**
 * The options for a PostgresQueryInterceptor instance.
 */
export interface PostgresQueryInterceptorOptions
  extends QueryInterceptorOptions {}

/**
 * A class that intercepts incoming Postgres requests sent through a TcpProxy instance.
 */
export class PostgresQueryInterceptor extends QueryInterceptor {
  /**
   * Creates an instance of PostgresQueryInterceptor.
   * @param options - The options for the PostgresQueryInterceptor instance.
   */
  constructor(options: PostgresQueryInterceptorOptions) {
    super(options);
  }

  /**
   * Handles incoming data from clients.
   * This method intercepts incoming Postgres queries and calls the onQuery hook function.
   * @param data - The incoming data from a client.
   * @param socket - The socket that the data was received on.
   * @returns The modified query data to be sent to the target server, or the original data if no modifications are needed.
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
   * This method intercepts incoming Postgres query results and calls the onResults hook function.
   * @param data - The incoming data from the target server.
   * @param socket - The socket that the data was received on.
   * @returns The modified result data to be sent back to the client, or the original data if no modifications are needed.
   */
  public handleDataFromDatabase(
    data: Buffer,
    socket: net.Socket
  ): Buffer | Promise<Buffer> {
    return this.onResults(data, socket) || data;
  }
}

export { TcpProxyOptions, TcpProxy };
