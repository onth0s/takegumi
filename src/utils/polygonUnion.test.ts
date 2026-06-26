import test from "node:test";
import assert from "node:assert";
import { unionTwoPolygons, discretizeRect } from "./polygonUnion";

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
});
