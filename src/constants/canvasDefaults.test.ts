import test from "node:test";
import assert from "node:assert";
import { snapWidth, snapGroupWidth, wtgWidthToPercent, wtgPercentToWidth } from "./canvasDefaults";

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
});
