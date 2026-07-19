import test from "node:test";
import assert from "node:assert";
import { createTextBlock, createTextGroup, createBlankPanel } from "./createProject";

test("createProject factory tests", async (t) => {
  await t.test("createTextBlock deep merges styles", () => {
    const block = createTextBlock({
      text: "Hello",
      style: {
        fontSize: 32,
      },
    });
    assert.strictEqual(block.text, "Hello");
    assert.strictEqual(block.style.fontSize, 32);
    // Preserves default color
    assert.strictEqual(block.style.color, "#ffffff");
  });

  await t.test("createTextGroup deep merges styles", () => {
    const group = createTextGroup(100, 200, {
      style: {
        borderRadius: 12,
      },
    });
    assert.strictEqual(group.x, 100);
    assert.strictEqual(group.y, 200);
    assert.strictEqual(group.style.borderRadius, 12);
    // Preserves default width/height
    assert.strictEqual(group.style.width, 200);
  });

  await t.test("createBlankPanel deep merges styles", () => {
    const panel = createBlankPanel({
      width: 400,
      style: {
        freeX: true,
      },
    });
    assert.strictEqual(panel.width, 400);
    assert.strictEqual(panel.style?.freeX, true);
    // Preserves other default settings
    assert.strictEqual(panel.borderColor, "#000000");
  });
});
