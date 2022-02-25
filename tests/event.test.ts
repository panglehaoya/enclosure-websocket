import WSEvent from "../src/event";

describe("event bus", () => {
  let eventBus: any = null;
  beforeEach(() => {
    eventBus = new WSEvent();
  });

  it("on event", () => {
    const fn = jest.fn();
    eventBus.on("test", fn);
    eventBus.emit("test");

    expect(fn).toHaveBeenCalled();
  });

  it("emit event", () => {
    const fn = jest.fn((val) => val);
    eventBus.on("event", fn);
    eventBus.emit("event", "hello");

    expect(fn).toHaveBeenCalledWith("hello");
  });
});
