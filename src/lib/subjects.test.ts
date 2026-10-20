import { describe, expect, it } from "vitest";
import { findSubjectByRouteId, subjectIdFromName, subjectRouteId, subjectsByGrade } from "./subjects";

describe("subject IDs", () => {
  it("creates URL-friendly IDs from subject names", () => {
    expect(subjectIdFromName("  C Programming  ")).toBe("c-programming");
  });

  it("keeps fallback subject IDs in sync with their names", () => {
    for (const subjects of Object.values(subjectsByGrade)) {
      for (const subject of subjects) {
        expect(subject.id).toBe(subjectIdFromName(subject.name));
      }
    }
  });

  it("uses a renamed subject name for its route while preserving its stored ID", () => {
    const subject = { id: "office-applications", name: "C Programming" };

    expect(subjectRouteId(subject)).toBe("c-programming");
    expect(findSubjectByRouteId([subject], "c-programming")).toEqual(subject);
    expect(findSubjectByRouteId([subject], "office-applications")).toEqual(subject);
  });
});
