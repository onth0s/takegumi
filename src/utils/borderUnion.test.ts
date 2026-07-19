/* eslint-disable @typescript-eslint/no-explicit-any */
import test from "node:test";
import assert from "node:assert";
import { computeUnionPath, computeBorderMaskRects } from "./borderUnion";

test("borderUnion tests", async (t) => {
  await t.test("computeUnionPath returns default box path if no union groups", () => {
    const panel: any = {
      width: 500,
      height: 400,
      textGroups: [],
    };
    const textGroupRects = new Map();
    const path = computeUnionPath(panel, textGroupRects, 4, false);
    assert.strictEqual(path, "M -2,-2 H 502 V 402 H -2 Z");
  });

  await t.test("computeBorderMaskRects returns empty if hideAllText is true", () => {
    const panel: any = { id: "p1", x: 0, y: 0, width: 500, height: 400 };
    const allPanels = [panel];
    const textGroupRects = new Map();
    const masks = computeBorderMaskRects(panel, allPanels, textGroupRects, true);
    assert.deepStrictEqual(masks, []);
  });

  await t.test("computeBorderMaskRects returns intersecting text group bounds from other panels", () => {
    const panel1: any = { id: "p1", x: 0, y: 0, width: 500, height: 400, textGroups: [] };
    const panel2: any = {
      id: "p2",
      x: 600,
      y: 0,
      width: 500,
      height: 400,
      textGroups: [
        { id: "g2", x: 50, y: 50, style: { borderMode: "overlap" } },
      ],
    };
    const allPanels = [panel1, panel2];
    const textGroupRects = new Map([
      ["g2", { width: 100, height: 80 }],
    ]);

    const masks = computeBorderMaskRects(panel1, allPanels, textGroupRects, false);
    assert.strictEqual(masks.length, 1);
    assert.deepStrictEqual(masks[0], { x: 0, y: 10, w: 100, h: 80 });
  });
});
