import { afterEach, describe, expect, it, vi } from "vitest";

import { getNikayas, getSutta, getSuttaList, type Nikaya, type Sutta } from "./sutta-data";

describe("sutta-data", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("getNikayas returns parsed array when fetch succeeds", async () => {
    const data: Nikaya[] = [
      { id: "dn", name: "Digha Nikaya", nameKo: "장아함", count: 34 },
      { id: "mn", name: "Majjhima Nikaya", nameKo: "중아함", count: 152 },
    ];

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(data),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getNikayas()).resolves.toEqual(data);
    expect(fetchMock).toHaveBeenCalledWith("/suttas/nikayas.json");
  });

  it("getNikayas throws when fetch returns 500", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getNikayas()).rejects.toThrow("Failed to load nikayas: 500");
    expect(fetchMock).toHaveBeenCalledWith("/suttas/nikayas.json");
  });

  it("getSuttaList returns parsed array for valid nikaya", async () => {
    const data = [
      { uid: "sn1.1", title: "Oghataraṇasutta" },
      { uid: "sn1.2", title: "Sarasutta" },
    ];

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(data),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getSuttaList("sn")).resolves.toEqual(data);
    expect(fetchMock).toHaveBeenCalledWith("/suttas/sn/index.json");
  });

  it("getSuttaList throws on 404", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getSuttaList("an")).rejects.toThrow("Failed to load sutta list for an: 404");
    expect(fetchMock).toHaveBeenCalledWith("/suttas/an/index.json");
  });

  it("getSutta returns sutta with segments for valid uid", async () => {
    const data: Sutta = {
      uid: "sn56.11",
      title: "Dhammacakkappavattanasutta",
      nikaya: "sn",
      segments: [
        {
          id: "sn56.11:1.1",
          pali: "Ekaṁ samayaṁ bhagavā bārāṇasiyaṁ viharati isipatane migadāye.",
        },
      ],
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(data),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getSutta("sn", "sn56.11")).resolves.toEqual(data);
    expect(fetchMock).toHaveBeenCalledWith("/suttas/sn/sn56.11.json");
  });

  it("getSutta throws on 404", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getSutta("sn", "sn56.12")).rejects.toThrow("Failed to load sutta sn56.12: 404");
    expect(fetchMock).toHaveBeenCalledWith("/suttas/sn/sn56.12.json");
  });
});
