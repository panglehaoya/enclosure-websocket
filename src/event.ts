export type EventType = string | symbol;
export type Handler<T = unknown> = (event: T) => void;

export type EventHandlerMap<Events extends Record<EventType, unknown>> = Map<
  keyof Events | "*",
  Array<Handler>
>;

class WSEvent {
  private all: EventHandlerMap<Record<EventType, unknown>> = new Map();

  on(type: EventType, handler: Handler) {
    const handlers = this.all.get(type);
    if (handlers) {
      handlers.push(handler);
    } else {
      this.all.set(type, [handler]);
    }
  }

  off(type: EventType, handler?: Handler) {
    const handlers = this.all.get(type);
    if (handlers) {
      if (handler) {
        const index = handlers.findIndex((h) => h === handler);
        if (index !== -1) {
          handlers.splice(index, 1);
        }
      } else {
        this.all.set(type, []);
      }
    }
  }

  emit(type: EventType, event?: unknown) {
    const handlers = this.all.get(type);
    if (handlers) {
      handlers.slice().map((h) => h(event));
    }
  }

  clear() {
    this.all = new Map();
  }
}

export default WSEvent;
