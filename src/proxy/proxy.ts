import * as net from "net";
import { EventEmitter } from "events";

/**
 * Options for the TcpProxy instance
 */
export interface TcpProxyOptions {
  /**
   * The hostname or IP address of the target server to proxy requests to
   */
  targetHost: string;
  /**
   * The port number of the target server to proxy requests to
   */
  targetPort: number;
  /**
   * The port number for the proxy server to listen on for incoming connections
   */
  listenPort: number;
}

/**
 * Hook functions to modify incoming/outgoing data on the proxy
 */
export interface TcpProxyHooks {
  /**
   * Function that is called with incoming client data and can modify the data before it is sent to the target
   * @param data - The incoming client data
   * @param socket - The client socket object
   * @returns The modified data to send to the target
   */
  clientData?: (data: Buffer, socket: net.Socket) => Buffer | Promise<Buffer>;

  /**
   * Function that is called with incoming target data and can modify the data before it is sent to the client
   * @param data - The incoming target data
   * @param socket - The target socket object
   * @returns The modified data to send to the client
   */
  targetData?: (data: Buffer, socket: net.Socket) => Buffer | Promise<Buffer>;
}

/**
 * Event names emitted by the TcpProxy instance
 */
export interface TcpProxyEvents {
  /**
   * Emitted when data is received from a client
   */
  "client-data": (data: Buffer, socket: net.Socket) => void;
  /**
   * Emitted when data is received from the target server
   */
  "target-data": (data: Buffer, socket: net.Socket) => void;
  /**
   * Emitted when the proxy server has started listening for incoming connections
   */
  listening: () => void;
  /**
   * Emitted when the proxy server has been closed and all connections have been terminated
   */
  closed: () => void;
  /**
   * Emitted when an error occurs
   */
  error: (err: Error) => void;
}

/**
 * A TCP proxy server implemented using Node.js's built-in `net` module
 */
export class TcpProxy extends EventEmitter {
  private server: net.Server;
  private options: TcpProxyOptions;
  private hooks: TcpProxyHooks;

  /**
   * Creates an instance of TcpProxy.
   * @param options - The options for the TcpProxy instance.
   * @param hooks - The hooks for the TcpProxy instance.
   */
  constructor(options: TcpProxyOptions, hooks: TcpProxyHooks = {}) {
    super();
    this.options = options;
    this.hooks = hooks;
    this.server = net.createServer(async (socket) => {
      const proxySocket = new net.Socket();

      proxySocket.connect(options.targetPort, options.targetHost, () => {
        this.emit("target-connected");
      });

      socket.pipe(proxySocket);
      proxySocket.pipe(socket);

      socket.on("data", async (data) => {
        this.emit("client-data", data, socket);
      });

      proxySocket.on("data", async (data) => {
        this.emit("target-data", data, proxySocket);
      });

      proxySocket.on("error", (err) => this.emit("error", err));
      socket.on("error", (err) => this.emit("error", err));
    });
    this.server.on("error", (err) => console.error(err));
  }

  /**
   * Starts the TcpProxy instance and begins listening for incoming connections.
   */
  start() {
    this.server.listen(this.options.listenPort, () => this.emit("listening"));
  }

  /**
   * Stops the TcpProxy instance and closes all connected clients and the listening socket.
   */
  stop() {
    this.server.close(() => this.emit("closed"));
  }

  /**
   * Sets the hooks for the TcpProxy instance.
   * @param hooks - The hooks to set.
   * @returns The TcpProxy instance.
   * @example
   * const proxy = new TcpProxy({ targetHost: "localhost", targetPort: 8080, listenPort: 8081 });
   * proxy.setHooks({
   *  clientData: (data) => {
   *   return data.toString().replace("foo", "bar");
   * }
   * });
   */
  setHooks(hooks: TcpProxyHooks) {
    this.hooks = hooks;
  }

  /**
   * Gets the hooks for the TcpProxy instance.
   * @returns The hooks for the TcpProxy instance.
   */
  getHooks() {
    return this.hooks;
  }

  /**
   * Gets the options for the TcpProxy instance.
   * @returns The options for the TcpProxy instance.
   */
  getListenPort() {
    return this.options.listenPort;
  }
}
