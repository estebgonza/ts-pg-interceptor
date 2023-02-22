import { TcpProxy, TcpProxyOptions } from "../src/proxy/proxy.js";
import net from "net";

describe("TcpProxy", () => {
  const testOptions: TcpProxyOptions = {
    targetHost: "localhost",
    targetPort: 8000,
    listenPort: 3000,
  };
  const tcpProxy = new TcpProxy(testOptions);

  beforeAll(() => {
    tcpProxy.start();
  });

  afterAll(() => {
    tcpProxy.stop();
  });

  test("tcpProxy should be an instance of TcpProxy", () => {
    expect(tcpProxy).toBeInstanceOf(TcpProxy);
  });

  test("tcpProxy should have correct options", () => {
    expect(tcpProxy.getListenPort()).toBe(testOptions.listenPort);
  });

  test("tcpProxy should proxy data from client to target", (done) => {
    const clientSocket = net.connect(testOptions.listenPort, () => {
      clientSocket.write("test data");
    });

    tcpProxy.on("target-data", (data, socket) => {
      expect(data.toString()).toBe("test data");
      done();
    });
  });

  test("tcpProxy should proxy data from target to client", (done) => {
    const clientSocket = net.connect(testOptions.listenPort, () => {
      clientSocket.write("test data");
    });

    clientSocket.on("data", (data) => {
      expect(data.toString()).toBe("test data");
    });

    tcpProxy.on("client-data", (data, socket) => {
      socket.write("test data");
    });

    clientSocket.on("end", () => {
      done();
    });
  });
});
