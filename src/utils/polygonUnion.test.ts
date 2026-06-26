import test from "node:test";
import assert from "node:assert";
import { unionTwoPolygons, discretizeRect, discretizeRoundedRect, discretizeActionBurst, discretizeTail } from "./polygonUnion";

test("Polygon Union Math Tests", async (t) => {
  await t.test("correctly computes the union of two overlapping rectangles", () => {
    // Rect A: [0, 0, 100, 100]
    const rectA = discretizeRect(0, 0, 100, 100);
    // Rect B: [50, 0, 100, 100] -> overlaps from x=50 to x=100
    const rectB = discretizeRect(50, 0, 100, 100);

    const union = unionTwoPolygons(rectA, rectB);
    
    // Union should be a single merged loop outlining [0, 0, 150, 100]
    assert.strictEqual(union.length, 1);
    
    const poly = union[0];
    // It should contain the outer bounds: x from 0 to 150, y from 0 to 100.
    const minX = Math.min(...poly.map(p => p[0]));
    const maxX = Math.max(...poly.map(p => p[0]));
    const minY = Math.min(...poly.map(p => p[1]));
    const maxY = Math.max(...poly.map(p => p[1]));

    assert.strictEqual(minX, 0);
    assert.strictEqual(maxX, 150);
    assert.strictEqual(minY, 0);
    assert.strictEqual(maxY, 100);
  });

  await t.test("returns two separate loops for non-overlapping shapes", () => {
    const rectA = discretizeRect(0, 0, 50, 50);
    const rectB = discretizeRect(100, 100, 50, 50);

    const union = unionTwoPolygons(rectA, rectB);
    assert.strictEqual(union.length, 2);
  });

  await t.test("discretizeRect returns 4 vertices outlining rect", () => {
    const pts = discretizeRect(10, 20, 100, 200);
    assert.strictEqual(pts.length, 4);
    assert.deepStrictEqual(pts, [
      [10, 20],
      [110, 20],
      [110, 220],
      [10, 220],
    ]);
  });

  await t.test("discretizeRoundedRect handles zero radius and returns discretized arcs", () => {
    const rectNoRadius = discretizeRoundedRect(10, 20, 100, 200, 0);
    assert.strictEqual(rectNoRadius.length, 4);

    const rectWithRadius = discretizeRoundedRect(10, 20, 100, 200, 10);
    // 4 corners, each corner arc discretizes to 9 points (steps = 8), removing 1 duplicate endpoint each,
    // so total points = 4 corners * 8 = 32 points.
    assert.strictEqual(rectWithRadius.length, 32);
    // Check bounds
    const minX = Math.min(...rectWithRadius.map(p => p[0]));
    const maxX = Math.max(...rectWithRadius.map(p => p[0]));
    assert.strictEqual(minX, 10);
    assert.strictEqual(maxX, 110);
  });

  await t.test("discretizeActionBurst returns 32 points alternating outer/inner vertices", () => {
    const pts = discretizeActionBurst(10, 20, 100, 200);
    assert.strictEqual(pts.length, 32);
    // Check that outer and inner points alternate correctly
    // Center is (60, 120), rx=50, ry=100. Inner valley is 0.85 * rx/ry
    const center = [60, 120];
    pts.forEach((pt, i) => {
      const dx = pt[0] - center[0];
      const dy = pt[1] - center[1];
      // distance ratio should be 1 for outer (even indices) and 0.85 for inner (odd indices) in ellipse space
      // (dx/rx)^2 + (dy/ry)^2 = ratio^2
      const val = Math.pow(dx / 50, 2) + Math.pow(dy / 100, 2);
      const expected = (i % 2 === 0) ? 1.0 : (0.85 * 0.85);
      assert.ok(Math.abs(val - expected) < 0.01);
    });
  });

  await t.test("discretizeTail returns 3 vertices mapped to panel coordinates", () => {
    const pts = discretizeTail(100, 200, 150, 250, 10, 20);
    assert.strictEqual(pts.length, 3);
    // The points should be shifted by gLeft=10, gTop=20
    assert.ok(pts.every(p => p[0] >= 10 && p[1] >= 20));
  });
});
