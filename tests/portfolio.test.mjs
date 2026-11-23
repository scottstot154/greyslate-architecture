import assert from "node:assert/strict";
import test from "node:test";
import { defaultStudio, projectSchema, samples, studioSchema } from "../lib/portfolio.ts";

test("the illustrative archive satisfies the same schema as editor submissions", () => {
  for (const project of samples) assert.deepEqual(projectSchema.parse(project), project);
  assert.deepEqual(studioSchema.parse(defaultStudio), defaultStudio);
});

test("before and after only accepts distinct photographs on real, completed renovations", () => {
  const sample = samples.find((project) => project.comparison);
  const valid = {
    ...sample,
    demo: false,
    comparison: {
      before: {...sample.comparison.before, kind: "Site photograph"},
      after: {...sample.comparison.after, kind: "Photograph"},
    },
  };
  assert.equal(projectSchema.safeParse(valid).success, true);
  for (const invalid of [
    {...valid, stage: "Construction"},
    {...valid, category: "Residential"},
    {...valid, comparison: sample.comparison},
    {...valid, comparison: {...valid.comparison, after: valid.comparison.before}},
  ]) assert.equal(projectSchema.safeParse(invalid).success, false);
});

test("validates milestone dates, local image sources and studio inquiry email", () => {
  const ongoing = samples.find((project) => project.updates.length);
  assert.equal(projectSchema.safeParse({...ongoing, updates: [{...ongoing.updates[0], date: "2026-02-31"}]}).success, false);
  assert.equal(projectSchema.safeParse({...ongoing, cover: {...ongoing.cover, src: "https://example.com/image.svg"}}).success, false);
  assert.equal(studioSchema.safeParse({...defaultStudio, email: "not-an-email"}).success, false);
});
