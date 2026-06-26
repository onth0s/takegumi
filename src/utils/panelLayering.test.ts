import test from "node:test";
import assert from "node:assert";
import type { WPanel } from "@/types/canvas";
import { bringToFront, sendToBack, bringForward, sendBackward, normalizeZIndices } from "./panelLayering";

function makeDummyPanel(id: string, zIndex?: number): WPanel {
  return {
    id,
    imageUrl: null,
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    borderEnabled: false,
    borderColor: "#000000",
    borderWidth: 4,
    disableSyntheticBorder: false,
    textGroups: [],
    zIndex,
  };
}

test("Panel Layering Tests", async (t) => {
  await t.test("normalizeZIndices assigns sequential z-indices based on current z-indices", () => {
    const panels = [
      makeDummyPanel("p1", 5),
      makeDummyPanel("p2", 2),
      makeDummyPanel("p3", 10),
    ];
    normalizeZIndices(panels);
    const p1 = panels.find(p => p.id === "p1")!;
    const p2 = panels.find(p => p.id === "p2")!;
    const p3 = panels.find(p => p.id === "p3")!;
    
    assert.strictEqual(p2.zIndex, 0);
    assert.strictEqual(p1.zIndex, 1);
    assert.strictEqual(p3.zIndex, 2);
  });

  await t.test("bringToFront puts the target panel at the highest zIndex", () => {
    const panels = [
      makeDummyPanel("p1", 0),
      makeDummyPanel("p2", 1),
      makeDummyPanel("p3", 2),
    ];
    bringToFront(panels, "p1");
    const p1 = panels.find(p => p.id === "p1")!;
    const p2 = panels.find(p => p.id === "p2")!;
    const p3 = panels.find(p => p.id === "p3")!;
    assert.strictEqual(p1.zIndex, 2);
    assert.strictEqual(p2.zIndex, 0);
    assert.strictEqual(p3.zIndex, 1);
  });

  await t.test("sendToBack puts the target panel at zIndex 0", () => {
    const panels = [
      makeDummyPanel("p1", 0),
      makeDummyPanel("p2", 1),
      makeDummyPanel("p3", 2),
    ];
    sendToBack(panels, "p3");
    const p1 = panels.find(p => p.id === "p1")!;
    const p2 = panels.find(p => p.id === "p2")!;
    const p3 = panels.find(p => p.id === "p3")!;
    assert.strictEqual(p3.zIndex, 0);
    assert.strictEqual(p1.zIndex, 1);
    assert.strictEqual(p2.zIndex, 2);
  });

  await t.test("bringForward swaps target with next panel's zIndex", () => {
    const panels = [
      makeDummyPanel("p1", 0),
      makeDummyPanel("p2", 1),
      makeDummyPanel("p3", 2),
    ];
    bringForward(panels, "p2");
    const p1 = panels.find(p => p.id === "p1")!;
    const p2 = panels.find(p => p.id === "p2")!;
    const p3 = panels.find(p => p.id === "p3")!;
    assert.strictEqual(p1.zIndex, 0);
    assert.strictEqual(p2.zIndex, 2);
    assert.strictEqual(p3.zIndex, 1);
  });

  await t.test("sendBackward swaps target with previous panel's zIndex", () => {
    const panels = [
      makeDummyPanel("p1", 0),
      makeDummyPanel("p2", 1),
      makeDummyPanel("p3", 2),
    ];
    sendBackward(panels, "p2");
    const p1 = panels.find(p => p.id === "p1")!;
    const p2 = panels.find(p => p.id === "p2")!;
    const p3 = panels.find(p => p.id === "p3")!;
    assert.strictEqual(p1.zIndex, 1);
    assert.strictEqual(p2.zIndex, 0);
    assert.strictEqual(p3.zIndex, 2);
  });
});
