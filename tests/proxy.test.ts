import { TcpProxy, TcpProxyOptions } from "../src/proxy/proxy";
import net from "net";

describe("TcpProxy", () => {
  let tcpProxy: TcpProxy;
  let targetServer: net.Server;
  const targetPort = 3001;
  const listenPort = 3002;

  beforeAll((done) => {
    const options: TcpProxyOptions = {
      targetHost: "localhost",
      targetPort,
      listenPort,
    };
    tcpProxy = new TcpProxy(options);
    tcpProxy.start();

    // Start a mock server to simulate the target server
    targetServer = net.createServer((socket) => {
      socket.on("data", (data) => {
        socket.write(data);
      });
    });

    targetServer.listen(targetPort, done);
  });

  afterAll(() => {
    targetServer.close();
    tcpProxy.stop();
  });

  test("should proxy client data to target server", (done) => {
    tcpProxy.on("client-data", (data: Buffer) => {
      expect(data.toString()).toBe("Hello world!");
    });

    tcpProxy.on("target-data", (data: Buffer) => {
      expect(data.toString()).toBe("Hello world!");
      done();
    });

    const client = net.connect({ port: listenPort }, () => {
      client.write("Hello world!");
    });
  });
});
