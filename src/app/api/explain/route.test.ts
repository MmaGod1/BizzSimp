import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/explain/route";

const requestBody = {
  previousMonth: { label: "August 2026", revenue: 200 },
  latestMonth: { label: "September 2026", revenue: 300 },
  items: [{ name: "Dress", previousRevenue: 200, latestRevenue: 300 }],
  omittedItemCount: 0,
};

function createRequest(body: unknown) {
  return new Request("http://localhost/api/explain", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "http://localhost",
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/explain", () => {
  beforeEach(() => {
    vi.stubEnv("GROQ_API_KEY", "test-api-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("reports missing server configuration without calling Groq", async () => {
    vi.stubEnv("GROQ_API_KEY", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(createRequest(requestBody));

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({
      error: expect.stringContaining("not configured"),
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects invalid data before sending a provider request", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      createRequest({ ...requestBody, items: [{ name: "bad\nname" }] }),
    );

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects oversized bodies even when the content length is not provided", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const request = new Request("http://localhost/api/explain", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost",
      },
      body: JSON.stringify({ ...requestBody, extra: "x".repeat(13_000) }),
    });

    const response = await POST(request);

    expect(response.status).toBe(413);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends only validated aggregate data to Groq and returns its explanation", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        choices: [
          {
            finish_reason: "stop",
            message: { content: "Revenue rose by $100." },
          },
        ],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(createRequest(requestBody));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      explanation: "Revenue rose by $100.",
    });
    expect(fetchMock).toHaveBeenCalledOnce();

    const [url, options] = fetchMock.mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(url).toBe("https://api.groq.com/openai/v1/chat/completions");
    expect(new Headers(options.headers).get("authorization")).toBe(
      "Bearer test-api-key",
    );
    const providerBody = JSON.parse(String(options.body)) as {
      messages: { content: string }[];
      max_completion_tokens: number;
      reasoning_effort: string;
      reasoning_format: string;
    };
    expect(providerBody.max_completion_tokens).toBe(512);
    expect(providerBody.reasoning_effort).toBe("low");
    expect(providerBody.reasoning_format).toBe("hidden");
    const prompt = providerBody.messages.map((message) => message.content).join();
    expect(prompt).toContain("August 2026");
    expect(prompt).toContain("Dress");
    expect(prompt).toContain("Nigerian naira");
    expect(prompt).not.toContain("2026-08-05");
  });

  it("strips unapproved fields before forwarding aggregate data", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        choices: [{ message: { content: "Revenue rose by $100." } }],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await POST(
      createRequest({
        ...requestBody,
        rawCsv: "private csv contents",
        previousMonth: {
          ...requestBody.previousMonth,
          transactionDate: "2026-08-05",
        },
        items: [
          {
            ...requestBody.items[0],
            quantity: 999,
          },
        ],
      }),
    );

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const providerBody = JSON.parse(String(options.body)) as {
      messages: { content: string }[];
    };
    const prompt = providerBody.messages.map((message) => message.content).join();
    expect(prompt).not.toContain("private csv contents");
    expect(prompt).not.toContain("transactionDate");
    expect(prompt).not.toContain("2026-08-05");
    expect(prompt).not.toContain("999");
  });

  it("returns a clear retry message when Groq rate limits the request", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 429 })));

    const response = await POST(createRequest(requestBody));

    expect(response.status).toBe(429);
    expect(await response.json()).toMatchObject({
      error: expect.stringContaining("wait a moment"),
    });
  });

  it("reports when Groq uses the completion budget before returning an explanation", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({
          choices: [
            {
              finish_reason: "length",
              message: { content: "" },
            },
          ],
        }),
      ),
    );

    const response = await POST(createRequest(requestBody));

    expect(response.status).toBe(502);
    expect(await response.json()).toMatchObject({
      error: expect.stringContaining("cut short"),
    });
  });
});
