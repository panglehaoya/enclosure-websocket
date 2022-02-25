import { EnclosureWebSocket } from "../src/websocket";
import WS from "jest-websocket-mock";

describe("ws", () => {
  test("should connected", async () => {
    const server = new WS("ws://localhost:1234");
    const client = new EnclosureWebSocket("ws://localhost:1234");
    client.init();
    await server.connected;
    const sendData = {
      event: "msg",
      data: { msg: "hello" },
    };
    client.sendMsg(sendData.event, sendData.data);

    expect(server).toReceiveMessage(JSON.stringify(sendData));
  });
});
