import { TcpProxy, TcpProxyOptions } from "../proxy/proxy";
import { EventEmitter } from "events";
import type net from "net";

export interface QueryInterceptorOptions extends TcpProxyOptions {
  onQuery?: HookInterceptor;
  onResults?: HookInterceptor;
}

type HookInterceptor = (
  data: Buffer,
  socket: net.Socket
) => Buffer | Promise<Buffer> | void;

/**
 * An abstract class that intercepts incoming requests sent through a TcpProxy instance.
 */
export abstract class RequestInterceptor extends EventEmitter {
  /**
   * The TcpProxy instance used to intercept incoming requests
   */
  protected proxy: TcpProxy;
  public onQuery: HookInterceptor = () => {};
  public onResults: HookInterceptor = () => {};

  /**
   * Creates an instance of RequestInterceptor
   * @param options - The options for the RequestInterceptor instance
   */
  constructor(options: QueryInterceptorOptions) {
    super();
    this.proxy = new TcpProxy(options);
    this.proxy.setHooks({
      clientData: this.handleDataFromClient.bind(this),
      targetData: this.handleDataFromDatabase.bind(this),
    });
    this.onQuery = options.onQuery || this.onQuery;
    this.onResults = options.onResults || this.onResults;
  }

  /**
   * Handles incoming data from clients.
   * @param data - The incoming data from a client.
   * @param socket - The socket that the data was received on.
   */
  protected abstract handleDataFromClient(
    data: Buffer,
    socket: net.Socket
  ): Buffer | Promise<Buffer>;

  /**
   * Handles incoming data from the target server.
   * @param data - The incoming data from the target server.
   * @param socket - The socket that the data was received on.
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
