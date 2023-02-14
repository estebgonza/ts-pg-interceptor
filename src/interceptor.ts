import { TcpProxy, TcpProxyOptions } from "./proxy";
import { EventEmitter } from "events";

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
export class PostgresRequestInterceptor extends EventEmitter {
  /**
   * The TcpProxy instance used to intercept incoming Postgres requests
   */
  private proxy: TcpProxy;

  /**
   * Creates an instance of PostgresRequestInterceptor
   * @param options - The options for the PostgresRequestInterceptor instance
   */
  constructor(options: PostgresRequestInterceptorOptions) {
    super();
    this.proxy = new TcpProxy(options);
    this.proxy.on("client-data", this.handleClientData.bind(this));
  }

  /**
   * Handles incoming data from clients.
   * @param data - The incoming data from a client.
   */
  private handleClientData(data: Buffer) {
    const str = data.toString().trim();
    if (str.startsWith("Q")) {
      this.emit("request", str.substring(1));
    }
  }

  /**
   * Starts the TcpProxy instance and begins intercepting incoming Postgres requests.
   */
  start() {
    this.proxy.start();
  }

  /**
   * Stops the TcpProxy instance and stops intercepting incoming Postgres requests.
   */
  stop() {
    this.proxy.stop();
  }
}
export { TcpProxyOptions, TcpProxy };
