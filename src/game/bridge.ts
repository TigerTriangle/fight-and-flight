type Cmd = "play" | "pause" | "resume" | "retry" | "title";

type Handler = (cmd: Cmd) => void;

const handlers = new Set<Handler>();
let last: Cmd | null = null;

export const bridge = {
  send(cmd: Cmd) {
    last = cmd;
    if (handlers.size === 0) return;
    for (const h of handlers) h(cmd);
  },
  on(handler: Handler) {
    handlers.add(handler);
    if (last === "play" || last === "retry") handler(last);
    return () => {
      handlers.delete(handler);
    };
  },
};
