import { RequestInterceptor } from "..";
import { TcpProxy, TcpProxyOptions } from "./../../proxy";
import type net from "net";

/**
 * The options for a PostgresRequestInterceptor instance
 */
export interface PostgresRequestInterceptorOptions extends TcpProxyOptions {}

/**
 * The events emitted by a PostgresRequestInterceptor instance
 */
export interface PostgresRequestInterceptorEvents {
  request: (request: string, socket: net.Socket) => void;
  response: (response: string, socket: net.Socket) => void;
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
  protected handleClientData(data: Buffer, socket: net.Socket) {
    const str = data.toString().trim();
    if (str.startsWith("Q")) {
      this.emit("request", str.substring(1), socket);
    }
  }

  /**
   * Handles incoming data from the target server.
   * @param data - The incoming data from the target server.
   * @param socket - The socket that the data was received on.
   * @returns The data to send to the client.
   */
  protected handleServerData(data: Buffer, socket: net.Socket) {
    this.emit("response", data, socket);
  }
}

export { TcpProxyOptions, TcpProxy };
