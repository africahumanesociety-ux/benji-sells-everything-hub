import { describe, it, expect } from "vitest";
import { reducer } from "./use-toast";

describe("toast reducer", () => {
  it("adds toasts and enforces toast limit", () => {
    const firstState = reducer(
      { toasts: [] },
      {
        type: "ADD_TOAST",
        toast: { id: "1", title: "First", open: true },
      },
    );

    const secondState = reducer(firstState, {
      type: "ADD_TOAST",
      toast: { id: "2", title: "Second", open: true },
    });

    expect(secondState.toasts).toHaveLength(1);
    expect(secondState.toasts[0].id).toBe("2");
  });

  it("updates a toast by id", () => {
    const state = reducer(
      { toasts: [{ id: "1", title: "Old", open: true }] },
      {
        type: "UPDATE_TOAST",
        toast: { id: "1", title: "New" },
      },
    );

    expect(state.toasts[0]).toMatchObject({ id: "1", title: "New", open: true });
  });

  it("dismisses a specific toast", () => {
    const state = reducer(
      {
        toasts: [
          { id: "1", title: "A", open: true },
          { id: "2", title: "B", open: true },
        ],
      },
      { type: "DISMISS_TOAST", toastId: "1" },
    );

    expect(state.toasts.find((t) => t.id === "1")?.open).toBe(false);
    expect(state.toasts.find((t) => t.id === "2")?.open).toBe(true);
  });

  it("dismisses all toasts when id is omitted", () => {
    const state = reducer(
      {
        toasts: [
          { id: "1", title: "A", open: true },
          { id: "2", title: "B", open: true },
        ],
      },
      { type: "DISMISS_TOAST" },
    );

    expect(state.toasts.every((t) => t.open === false)).toBe(true);
  });

  it("removes one toast or clears all toasts", () => {
    const removedOne = reducer(
      {
        toasts: [
          { id: "1", title: "A", open: false },
          { id: "2", title: "B", open: false },
        ],
      },
      { type: "REMOVE_TOAST", toastId: "1" },
    );
    const cleared = reducer(removedOne, { type: "REMOVE_TOAST" });

    expect(removedOne.toasts.map((t) => t.id)).toEqual(["2"]);
    expect(cleared.toasts).toEqual([]);
  });
});
