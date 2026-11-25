import { describe, expect, it } from "vitest";
import * as schema from "../src/db/schema";

describe("database schema", () => {
  it("exports model definitions", () => {
    expect(Object.keys(schema).length).toBeGreaterThan(0);
  });

  it("exports relations for every table", () => {
    expect(schema.usersRelations).toBeDefined();
    expect(schema.sessionsRelations).toBeDefined();
    expect(schema.willsRelations).toBeDefined();
    expect(schema.willVersionsRelations).toBeDefined();
    expect(schema.beneficiariesRelations).toBeDefined();
    expect(schema.assetsRelations).toBeDefined();
    expect(schema.bequestsRelations).toBeDefined();
    expect(schema.executorsRelations).toBeDefined();
    expect(schema.witnessesRelations).toBeDefined();
  });
});
