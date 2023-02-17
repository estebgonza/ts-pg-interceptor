import net from "net";
import { TcpProxy, TcpProxyOptions } from ".";

describe("TcpProxy", () => {
  const targetPort = 3001;
  const listenPort = 3000;
  let targetServer: net.Server;
  let proxy: TcpProxy;

  const createTargetServer = () => {
    targetServer = net.createServer((socket) => {
      socket.on("data", (data) => {
        socket.write(data);
      });
    });
    targetServer.listen(targetPort);
  };

  const createProxy = () => {
    const options: TcpProxyOptions = {
      targetHost: "localhost",
      targetPort,
      listenPort,
    };
    proxy = new TcpProxy(options);
  };

  const connectClientToProxy = async () => {
    const client = net.connect(listenPort);
    await new Promise((resolve) => {
      client.on("connect", resolve);
    });
    return client;
  };

  beforeAll(() => {
    createTargetServer();
    createProxy();
    proxy.start();
  });

  afterAll(() => {
    proxy.stop();
    targetServer.close();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("start", () => {
    it("should emit a 'listening' event when the server starts", (done) => {
      const spy = jest.spyOn(proxy, "emit");

      proxy.stop();
      proxy.start();

      setTimeout(() => {
        expect(spy).toHaveBeenCalledWith("listening");
        done();
      }, 100);
    });
  });

  describe("stop", () => {
    it("should emit a 'closed' event when the server stops", (done) => {
      const spy = jest.spyOn(proxy, "emit");

      proxy.stop();

      setTimeout(() => {
        expect(spy).toHaveBeenCalledWith("closed");
        done();
      }, 100);
    });
  });

  describe("client-data", () => {
    it("should emit a 'client-data' event with the incoming data and client socket", (done) => {
      const spy = jest.spyOn(proxy, "emit");
      const expectedData = "test data";

      connectClientToProxy().then((client) => {
        client.write(expectedData);
        proxy.on("client-data", (_data: Buffer, socket) => {
          console.log("OUI CLIENT DATA");
          console.log(socket);
        });
        setTimeout(() => {
          expect(spy).toHaveBeenCalledWith(
            "client-data",
            expect.any(Buffer),
            client
          );
          done();
        }, 100);
      });
    });

    it("should allow manipulating the incoming data and sending to target", (done) => {
      const expectedData = "test data";
      const newData = "modified test data";

      proxy.on("client-data", (_data: Buffer, socket) => {
        const modifiedData = Buffer.from(newData);
        socket.write(modifiedData);
      });

      const client = connectClientToProxy();

      client.then((client) => {
        client.on("data", (data) => {
          expect(data.toString()).toBe(newData);
          done();
        });

        client.write(expectedData);
      });
    });
  });

  describe("target-data", () => {
    it("should emit a 'target-data' event with the incoming data and target socket", (done) => {
      const spy = jest.spyOn(proxy, "emit");
      const expectedData = "test data";

      connectClientToProxy().then((client) => {
        client.write(expectedData);

        setTimeout(() => {
          expect(spy).toHaveBeenCalledWith(
            "target-data",
            expect.any(Buffer),
            expect.any(net.Socket)
          );
          done();
        }, 100);
      });
    });

    it("should allow manipulating the incoming data and sending to client", (done) => {
      const expectedData = "test data";
      const newData = "modified test data";

      proxy.on("target-data", (_data: Buffer, socket: net.Socket) => {
        const modifiedData = Buffer.from(newData);
        socket.write(modifiedData);
      });

      const client = connectClientToProxy();

      client.then((client) => {
        client.on("data", (data) => {
          expect(data.toString()).toBe(newData);
          done();
        });

        client.write(expectedData);
      });
    });
  });
});
