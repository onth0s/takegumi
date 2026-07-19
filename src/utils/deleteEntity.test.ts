/* eslint-disable @typescript-eslint/no-explicit-any */
import test from "node:test";
import assert from "node:assert";
import { deleteSelectedEntity } from "./deleteEntity";

test("deleteSelectedEntity tests", async (t) => {
  await t.test("deletes text block if more than one block exists", () => {
    const project: any = {
      panels: [
        {
          id: "p1",
          textGroups: [
            {
              id: "g1",
              blocks: [
                { id: "b1", text: "Block 1" },
                { id: "b2", text: "Block 2" },
              ],
            },
          ],
        },
      ],
    };
    const res = deleteSelectedEntity(project, "p1", "g1", "b1");
    assert.deepStrictEqual(res, { deletedId: "b1", type: "block" });
    assert.strictEqual(project.panels[0].textGroups[0].blocks.length, 1);
    assert.strictEqual(project.panels[0].textGroups[0].blocks[0].id, "b2");
  });

  await t.test("does not delete text block if only one block exists", () => {
    const project: any = {
      panels: [
        {
          id: "p1",
          textGroups: [
            {
              id: "g1",
              blocks: [
                { id: "b1", text: "Block 1" },
              ],
            },
          ],
        },
      ],
    };
    const res = deleteSelectedEntity(project, "p1", "g1", "b1");
    assert.strictEqual(res, null);
    assert.strictEqual(project.panels[0].textGroups[0].blocks.length, 1);
  });

  await t.test("deletes text group", () => {
    const project: any = {
      panels: [
        {
          id: "p1",
          textGroups: [
            { id: "g1", blocks: [{ id: "b1" }] },
            { id: "g2", blocks: [{ id: "b2" }] },
          ],
        },
      ],
    };
    const res = deleteSelectedEntity(project, "p1", "g2", null);
    assert.deepStrictEqual(res, { deletedId: "g2", type: "group" });
    assert.strictEqual(project.panels[0].textGroups.length, 1);
    assert.strictEqual(project.panels[0].textGroups[0].id, "g1");
  });

  await t.test("deletes panel", () => {
    const project: any = {
      panels: [
        { id: "p1", textGroups: [] },
        { id: "p2", textGroups: [] },
      ],
    };
    const res = deleteSelectedEntity(project, "p2", null, null);
    assert.deepStrictEqual(res, { deletedId: "p2", type: "panel" });
    assert.strictEqual(project.panels.length, 1);
    assert.strictEqual(project.panels[0].id, "p1");
  });
});
