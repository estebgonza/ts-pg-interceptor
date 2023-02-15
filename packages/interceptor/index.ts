import { TcpProxy, TcpProxyOptions } from "../proxy";
import { EventEmitter } from "events";

/**
 * An abstract class that intercepts incoming requests sent through a TcpProxy instance.
 */
export abstract class RequestInterceptor extends EventEmitter {
  /**
   * The TcpProxy instance used to intercept incoming requests
   */
  protected proxy: TcpProxy;

  /**
   * Creates an instance of RequestInterceptor
   * @param options - The options for the RequestInterceptor instance
   */
  constructor(options: TcpProxyOptions) {
    super();
    this.proxy = new TcpProxy(options);
    this.proxy.on("client-data", this.handleClientData.bind(this));
  }

  /**
   * Handles incoming data from clients.
   * @param data - The incoming data from a client.
   */
  protected abstract handleClientData(data: Buffer): void;

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
