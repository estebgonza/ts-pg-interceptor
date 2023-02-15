import net from "net";
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
 * Event names emitted by the TcpProxy instance
 */
export interface TcpProxyEvents {
  /**
   * Emitted when data is received from a client
   */
  "client-data": (data: Buffer) => void;
  /**
   * Emitted when data is received from the target server
   */
  "target-data": (data: Buffer) => void;
  /**
   * Emitted when the proxy server has started listening for incoming connections
   */
  listening: () => void;
  /**
   * Emitted when the proxy server has been closed and all connections have been terminated
   */
  closed: () => void;
}

/**
 * A TCP proxy server implemented using Node.js's built-in `net` module
 */
export class TcpProxy extends EventEmitter {
  private server: net.Server;
  private options: TcpProxyOptions;

  /**
   * Creates an instance of TcpProxy.
   * @param options - The options for the TcpProxy instance.
   */
  constructor(options: TcpProxyOptions) {
    super();
    this.options = options;
    this.server = net.createServer(async (socket) => {
      const proxySocket = new net.Socket();

      proxySocket.connect(options.targetPort, options.targetHost, () => {
        this.emit("target-connected");
      });

      socket.on("data", (data) => {
        this.emit("client-data", data);
        proxySocket.write(data);
      });

      proxySocket.on("data", (data) => {
        this.emit("target-data", data);
        socket.write(data);
      });
    });
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
}
