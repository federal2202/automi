import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useTaskSSE } from "./useTaskSSE";

class MockEventSource {
  static instances: MockEventSource[] = [];
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: (() => void) | null = null;
  close = vi.fn();
  url: string;
  withCredentials: boolean;

  constructor(url: string, init?: { withCredentials?: boolean }) {
    this.url = url;
    this.withCredentials = init?.withCredentials ?? false;
    MockEventSource.instances.push(this);
  }
}

function renderWithClient() {
  const queryClient = new QueryClient();
  const { result, unmount } = renderHook(() => useTaskSSE(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
  return { result, unmount, queryClient };
}

describe("useTaskSSE", () => {
  beforeEach(() => {
    MockEventSource.instances = [];
    (globalThis as unknown as { EventSource: typeof MockEventSource }).EventSource = MockEventSource;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // BUG-1 regression: the accessToken cookie is httpOnly and unreadable from
  // JS. The fix was to stop reading it entirely and rely on the browser
  // sending it automatically — assert the connection is opened exactly that
  // way, with no token anywhere in the URL.
  it("opens the connection with withCredentials and no token in the URL", () => {
    renderWithClient();

    expect(MockEventSource.instances).toHaveLength(1);
    const es = MockEventSource.instances[0];
    expect(es.withCredentials).toBe(true);
    expect(es.url).not.toContain("token=");
    expect(es.url.endsWith("/sse")).toBe(true);
  });

  it("invalidates the ['tasks'] query on a task.enriched message", () => {
    const { queryClient } = renderWithClient();
    const spy = vi.spyOn(queryClient, "invalidateQueries");
    const es = MockEventSource.instances[0];

    es.onmessage?.({ data: JSON.stringify({ type: "task.enriched", taskId: "t1" }) } as MessageEvent);

    expect(spy).toHaveBeenCalledWith({ queryKey: ["tasks"] });
  });

  it("ignores messages of an unknown type", () => {
    const { queryClient } = renderWithClient();
    const spy = vi.spyOn(queryClient, "invalidateQueries");
    const es = MockEventSource.instances[0];

    es.onmessage?.({ data: JSON.stringify({ type: "something.else" }) } as MessageEvent);

    expect(spy).not.toHaveBeenCalled();
  });

  // BUG-11 regression: onerror must NOT close the connection — that used to
  // permanently kill the browser's native EventSource auto-reconnect after
  // the first proxy timeout.
  it("does not close the connection on error (lets the browser auto-reconnect)", () => {
    renderWithClient();
    const es = MockEventSource.instances[0];

    es.onerror?.();

    expect(es.close).not.toHaveBeenCalled();
  });

  it("closes the connection on unmount", () => {
    const { unmount } = renderWithClient();
    const es = MockEventSource.instances[0];

    unmount();

    expect(es.close).toHaveBeenCalledTimes(1);
  });
});
