import { TcpProxy, TcpProxyOptions } from "../proxy/proxy.js";
import { EventEmitter } from "events";
import * as net from "net";

/**
 * Options for configuring a QueryInterceptor instance.
 */
export interface QueryInterceptorOptions extends TcpProxyOptions {
  /**
   * Hook function to intercept incoming client queries.
   * @param data - The incoming query data from a client.
   * @param socket - The socket that the data was received on.
   * @returns The modified query data to be sent to the target server.
   */
  onQuery?: HookInterceptor;

  /**
   * Hook function to intercept query results returned by the target server.
   * @param data - The incoming result data from the target server.
   * @param socket - The socket that the data was received on.
   * @returns The modified result data to be sent back to the client.
   */
  onResults?: HookInterceptor;
}

/**
 * Function type for hook interceptors used by QueryInterceptor.
 * @param data - The incoming data from a client or target server.
 * @param socket - The socket that the data was received on.
 * @returns The modified data to be sent to the target server or client, or void if no modifications are needed.
 */
type HookInterceptor = (
  data: Buffer,
  socket: net.Socket
) => Buffer | Promise<Buffer> | void;

/**
 * An abstract class that intercepts incoming requests sent through a TcpProxy instance.
 */
export abstract class QueryInterceptor extends EventEmitter {
  /**
   * The TcpProxy instance used to intercept incoming requests.
   */
  protected proxy: TcpProxy;

  /**
   * Hook function to intercept incoming client queries.
   */
  public onQuery: HookInterceptor = () => {};

  /**
   * Hook function to intercept query results returned by the target server.
   */
  public onResults: HookInterceptor = () => {};

  /**
   * Creates an instance of QueryInterceptor.
   * @param options - The options for the QueryInterceptor instance.
   */
  constructor(options: QueryInterceptorOptions) {
    super();

    // Create a new TcpProxy instance with the provided options and set its hook functions
    this.proxy = new TcpProxy(options);
    this.proxy.setHooks({
      clientData: this.handleDataFromClient.bind(this),
      targetData: this.handleDataFromDatabase.bind(this),
    });

    // Set the onQuery and onResults hook functions to the provided values or to the defaults if not provided
    this.onQuery = options.onQuery || this.onQuery;
    this.onResults = options.onResults || this.onResults;
  }

  /**
   * Handles incoming data from clients.
   * This method should be implemented by the subclass to modify the query data as needed.
   * @param data - The incoming query data from a client.
   * @param socket - The socket that the data was received on.
   * @returns The modified query data to be sent to the target server.
   */
  protected abstract handleDataFromClient(
    data: Buffer,
    socket: net.Socket
  ): Buffer | Promise<Buffer>;

  /**
   * Handles incoming data from the target server.
   * This method should be implemented by the subclass to modify the result data as needed.
   * @param data - The incoming result data from the target server.
   * @param socket - The socket that the data was received on.
   * @returns The modified result data to be sent back to the client.
   */
  protected abstract handleDataFromDatabase(
    data: Buffer,
    socket: net.Socket
  ): Buffer | Promise<Buffer>;

  /**
   * Starts the TcpProxy instance and begins intercepting incoming requests.
   */
  start() {
    this.proxy.start();
  }

  /**
   * Stops the TcpProxy instance and stops intercepting incoming requests.
   */
  stop() {
    this.proxy.stop();
  }
}
