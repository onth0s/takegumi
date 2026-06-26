import test from "node:test";
import assert from "node:assert";
import { getGroupLocalRect } from "./groupGeometry";

test("Group Geometry Tests", async (t) => {
  await t.test("correctly computes panel-local bounding rect for group", () => {
    const group = { x: 100, y: 200 };
    const panelX = 10;
    const panelY = 20;
    const width = 80;
    const height = 40;

    const rect = getGroupLocalRect(group, panelX, panelY, width, height);

    assert.strictEqual(rect.left, 50);
    assert.strictEqual(rect.top, 160);
    assert.strictEqual(rect.right, 130);
    assert.strictEqual(rect.bottom, 200);
    assert.strictEqual(rect.width, 80);
    assert.strictEqual(rect.height, 40);
  });
});
