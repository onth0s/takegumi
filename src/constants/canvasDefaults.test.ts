import test from "node:test";
import assert from "node:assert";
import { wtgPercentToWidth, wtgPercentToHeight } from "./layout";
import { snapGroupWidth, snapGroupHeight } from "../utils/snapMath";

test("WTextGroup Snapping Verification Tests", async (t) => {
  const GRID_SIZE = 48;

  await t.test("snaps width correctly to nearest grid multiple when snap is enabled", () => {
    // 43% of 960 is 412.8px -> wtgPercentToWidth(43) rounds to 413px
    const rawPx = wtgPercentToWidth(43); 
    const snapped = snapGroupWidth(rawPx, GRID_SIZE * 2, true, false);
    
    // Snapped to multiples of 96 (48 * 2): 384, 480
    // 413 is closer to 384 (diff 29) than 480 (diff 67).
    assert.strictEqual(snapped % (GRID_SIZE * 2), 0);
    assert.strictEqual(snapped, 384);
  });

  await t.test("does not snap width and preserves custom size when freeWidth is true", () => {
    const rawPx = wtgPercentToWidth(43);
    const snapped = snapGroupWidth(rawPx, GRID_SIZE, true, true);
    assert.strictEqual(snapped, rawPx); // Should be exactly 413px
  });

  await t.test("does not snap width and returns 0 when wrap/tight sentinel (0) is passed", () => {
    const snapped = snapGroupWidth(0, GRID_SIZE, true, false);
    assert.strictEqual(snapped, 0);
  });

  await t.test("snaps height correctly to nearest grid multiple when snap is enabled", () => {
    // WTG_MAX_HEIGHT = 600. 43% of 600 is 258px.
    const rawPx = wtgPercentToHeight(43);
    const snapped = snapGroupHeight(rawPx, GRID_SIZE * 2, true, false);
    
    // Snapped to multiples of 96 (48 * 2): 192, 288
    // 258 is closer to 288 (diff 30) than 192 (diff 66).
    assert.strictEqual(snapped % (GRID_SIZE * 2), 0);
    assert.strictEqual(snapped, 288);
  });

  await t.test("does not snap height and preserves custom size when freeHeight is true", () => {
    const rawPx = wtgPercentToHeight(43);
    const snapped = snapGroupHeight(rawPx, GRID_SIZE, true, true);
    assert.strictEqual(snapped, rawPx); // Should be exactly 258px
  });

  await t.test("does not snap height and returns 0 when wrap/tight sentinel (0) is passed", () => {
    const snapped = snapGroupHeight(0, GRID_SIZE, true, false);
    assert.strictEqual(snapped, 0);
  });
});

import { DEFAULT_GRID_SIZE, DEFAULT_WTG_OPACITY, DEFAULT_WTB_FONT_SIZE } from "./canvasDefaults";

test("YAML Schema Integrity & Defaults Verification", async (t) => {
  await t.test("verifies canvasDefaults exports valid non-null constants", () => {
    assert.ok(typeof DEFAULT_GRID_SIZE === "number" && DEFAULT_GRID_SIZE > 0);
    assert.ok(typeof DEFAULT_WTG_OPACITY === "number" && DEFAULT_WTG_OPACITY >= 0);
    assert.ok(typeof DEFAULT_WTB_FONT_SIZE === "number" && DEFAULT_WTB_FONT_SIZE > 0);
  });
});
