import { relations, sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const willStatusEnum = pgEnum("will_status", ["draft", "ready_to_sign", "signed", "revoked"]);
export const bequestKindEnum = pgEnum("bequest_kind", ["specific", "residuary", "pecuniary"]);
export const assetKindEnum = pgEnum("asset_kind", [
  "land",
  "bank_account",
  "vehicle",
  "shares",
  "sacco",
  "pension",
  "personal_effects",
  "business",
  "digital",
  "other",
]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    passwordHash: text("password_hash").notNull(),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    // Testators sign under Kenya's Law of Succession Act (Cap. 160). Minors can't make a valid will.
    dateOfBirth: date("date_of_birth", { mode: "string" }),
    nationalId: text("national_id"),
    ...timestamps,
  },
  (t) => [uniqueIndex("users_email_lower_idx").on(sql`lower(${t.email})`)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

/** The master document for one testator. Revising a will replaces the active version row, not this one. */
export const wills = pgTable(
  "wills",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    testatorId: uuid("testator_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: willStatusEnum("status").notNull().default("draft"),
    preamble: text("preamble").notNull().default(""),
    revocationClause: text("revocation_clause").notNull().default(""),
    guardianshipClause: text("guardianship_clause").notNull().default(""),
    funeralWishes: text("funeral_wishes").notNull().default(""),
    signedOn: date("signed_on", { mode: "string" }),
    ...timestamps,
  },
  (t) => [uniqueIndex("wills_testator_idx").on(t.testatorId)],
);

/** A snapshot of the full will text at a point in time, generated when the testator "finalises". */
export const willVersions = pgTable(
  "will_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    willId: uuid("will_id")
      .notNull()
      .references(() => wills.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    bodyMd: text("body_md").notNull(),
    pdfSha256: text("pdf_sha256"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("will_versions_will_version_idx").on(t.willId, t.version)],
);

export const beneficiaries = pgTable(
  "beneficiaries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    willId: uuid("will_id")
      .notNull()
      .references(() => wills.id, { onDelete: "cascade" }),
    fullName: text("full_name").notNull(),
    relationship: text("relationship").notNull(),
    nationalId: text("national_id"),
    dateOfBirth: date("date_of_birth", { mode: "string" }),
    contact: text("contact"),
    isMinor: boolean("is_minor").notNull().default(false),
  },
  (t) => [index("beneficiaries_will_idx").on(t.willId)],
);

export const assets = pgTable(
  "assets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    willId: uuid("will_id")
      .notNull()
      .references(() => wills.id, { onDelete: "cascade" }),
    kind: assetKindEnum("kind").notNull(),
    description: text("description").notNull(),
    // Reference specific to the asset: title number for land, A/C number for bank, reg plate for a car.
    reference: text("reference"),
    valueKes: integer("value_kes"),
  },
  (t) => [index("assets_will_idx").on(t.willId)],
);

export const bequests = pgTable(
  "bequests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    willId: uuid("will_id")
      .notNull()
      .references(() => wills.id, { onDelete: "cascade" }),
    kind: bequestKindEnum("kind").notNull(),
    // Specific bequest: one asset to one beneficiary.
    assetId: uuid("asset_id").references(() => assets.id, { onDelete: "set null" }),
    beneficiaryId: uuid("beneficiary_id")
      .notNull()
      .references(() => beneficiaries.id, { onDelete: "restrict" }),
    // Residuary bequests use a share-of-residue in basis points (10000 == whole residue).
    sharePercentageBps: integer("share_percentage_bps"),
    pecuniaryAmountKes: integer("pecuniary_amount_kes"),
    conditions: text("conditions").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("bequests_will_idx").on(t.willId)],
);

export const executors = pgTable(
  "executors",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    willId: uuid("will_id")
      .notNull()
      .references(() => wills.id, { onDelete: "cascade" }),
    fullName: text("full_name").notNull(),
    nationalId: text("national_id"),
    relationship: text("relationship"),
    contact: text("contact"),
    isAlternate: boolean("is_alternate").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("executors_will_idx").on(t.willId)],
);

/** The will is only valid when signed in the presence of two competent witnesses (s.11 of the Act). */
export const witnesses = pgTable(
  "witnesses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    willId: uuid("will_id")
      .notNull()
      .references(() => wills.id, { onDelete: "cascade" }),
    fullName: text("full_name").notNull(),
    nationalId: text("national_id"),
    occupation: text("occupation"),
    signedOn: date("signed_on", { mode: "string" }),
  },
  (t) => [index("witnesses_will_idx").on(t.willId)],
);

export const willRelations = relations(wills, ({ one, many }) => ({
  testator: one(users, { fields: [wills.testatorId], references: [users.id] }),
  versions: many(willVersions),
  beneficiaries: many(beneficiaries),
  bequests: many(bequests),
  executors: many(executors),
  witnesses: many(witnesses),
  assets: many(assets),
}));

export type Will = typeof wills.$inferSelect;
export type Beneficiary = typeof beneficiaries.$inferSelect;
export type Asset = typeof assets.$inferSelect;
export type Bequest = typeof bequests.$inferSelect;
export type Executor = typeof executors.$inferSelect;
export type Witness = typeof witnesses.$inferSelect;
