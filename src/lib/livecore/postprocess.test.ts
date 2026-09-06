import { describe, expect, it, vi } from "vitest";
import { postprocessReply } from "./postprocess";

describe("postprocessReply", () => {
  it("normalizes wrappers, whitespace, and mention markers", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    expect(postprocessReply('  「 hello   @world 」  ', 32)).toBe("hello world");
    vi.restoreAllMocks();
  });

  it("rejects blocked promotion and link content", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    expect(postprocessReply("欢迎加微信领取", 32)).toBeNull();
    expect(postprocessReply("https://example.com", 32)).toBeNull();
    vi.restoreAllMocks();
  });

  it("enforces the configured reply length", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    expect(postprocessReply("123456789", 5)).toBe("12345");
    vi.restoreAllMocks();
  });
});
