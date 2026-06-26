import test from "node:test";
import assert from "node:assert";
import type { WProject } from "@/types/canvas";
import { shiftPanelsBelow } from "./panelReflow";

function makeDummyProject(): WProject {
  return {
    id: "proj1",
    name: "Test Project",
    grid: { size: 10, snapEnabled: true, showGrid: true },
    canvasTheme: "light",
    createdAt: "",
    updatedAt: "",
    panels: [
      {
        id: "p1",
        imageUrl: null,
        x: 0,
        y: 10,
        width: 100,
        height: 100,
        borderEnabled: false,
        borderColor: "#000000",
        borderWidth: 4,
        disableSyntheticBorder: false,
        zIndex: 0,
        textGroups: [
          {
            id: "g1",
            x: 50,
            y: 50,
            style: {},
            tailAnchor: { x: 60, y: 60 },
            blocks: [],
          }
        ]
      },
      {
        id: "p2",
        imageUrl: null,
        x: 0,
        y: 150,
        width: 100,
        height: 100,
        borderEnabled: false,
        borderColor: "#000000",
        borderWidth: 4,
        disableSyntheticBorder: false,
        zIndex: 1,
        textGroups: [
          {
            id: "g2",
            x: 50,
            y: 190,
            style: {},
            tailAnchor: null,
            blocks: [],
          }
        ]
      }
    ]
  };
}

test("Panel Reflow Tests", async (t) => {
  await t.test("shifts target panel text groups and subsequent panels", () => {
    const project = makeDummyProject();
    shiftPanelsBelow(project, "p1", 20);

    const g1 = project.panels[0].textGroups[0];
    assert.strictEqual(g1.y, 70);
    assert.strictEqual(g1.tailAnchor!.y, 80);

    assert.strictEqual(project.panels[0].y, 10);

    assert.strictEqual(project.panels[1].y, 170);
    const g2 = project.panels[1].textGroups[0];
    assert.strictEqual(g2.y, 210);
  });

  await t.test("does nothing if deltaY is 0", () => {
    const project = makeDummyProject();
    shiftPanelsBelow(project, "p1", 0);

    assert.strictEqual(project.panels[0].textGroups[0].y, 50);
    assert.strictEqual(project.panels[1].y, 150);
  });
});
