"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  createBillSchema: () => createBillSchema,
  createTagSchema: () => createTagSchema,
  externalContactSchema: () => externalContactSchema,
  inviteConnectionSchema: () => inviteConnectionSchema,
  reorderBillsSchema: () => reorderBillsSchema,
  toggleSharedStatusSchema: () => toggleSharedStatusSchema,
  updateBillSchema: () => updateBillSchema,
  updateMonthlyBillSchema: () => updateMonthlyBillSchema,
  updateTagSchema: () => updateTagSchema
});
module.exports = __toCommonJS(index_exports);

// src/schemas.ts
var import_zod = require("zod");
var externalContactSchema = import_zod.z.object({
  name: import_zod.z.string().min(1).max(100),
  phone: import_zod.z.string().max(20).optional()
});
var sharedFields = {
  sharedWithUserId: import_zod.z.string().optional(),
  externalContact: externalContactSchema.optional()
};
var createBillSchema = import_zod.z.object({
  name: import_zod.z.string().min(1, "Name is required").max(100),
  amount: import_zod.z.number().positive().optional(),
  where: import_zod.z.string().max(200).optional(),
  notes: import_zod.z.string().max(500).optional(),
  isShared: import_zod.z.boolean().default(false),
  ...sharedFields,
  splitType: import_zod.z.enum(["half", "custom"]).optional(),
  customSplitAmount: import_zod.z.number().positive().optional(),
  payerUserId: import_zod.z.string().optional(),
  order: import_zod.z.number().int().min(0).default(0),
  tagIds: import_zod.z.array(import_zod.z.string()).optional()
}).superRefine((data, ctx) => {
  if (data.sharedWithUserId && data.externalContact) {
    ctx.addIssue({
      code: import_zod.z.ZodIssueCode.custom,
      message: "sharedWithUserId and externalContact are mutually exclusive",
      path: ["externalContact"]
    });
  }
});
var updateBillSchema = import_zod.z.object({
  name: import_zod.z.string().min(1).max(100).optional(),
  amount: import_zod.z.number().positive().nullable().optional(),
  where: import_zod.z.string().max(200).nullable().optional(),
  notes: import_zod.z.string().max(500).nullable().optional(),
  isShared: import_zod.z.boolean().optional(),
  sharedWithUserId: import_zod.z.string().nullable().optional(),
  externalContact: externalContactSchema.nullable().optional(),
  splitType: import_zod.z.enum(["half", "custom"]).nullable().optional(),
  customSplitAmount: import_zod.z.number().positive().nullable().optional(),
  payerUserId: import_zod.z.string().nullable().optional(),
  active: import_zod.z.boolean().optional(),
  order: import_zod.z.number().int().min(0).optional(),
  tagIds: import_zod.z.array(import_zod.z.string()).optional()
}).superRefine((data, ctx) => {
  if (data.sharedWithUserId && data.externalContact) {
    ctx.addIssue({
      code: import_zod.z.ZodIssueCode.custom,
      message: "sharedWithUserId and externalContact are mutually exclusive",
      path: ["externalContact"]
    });
  }
});
var updateMonthlyBillSchema = import_zod.z.object({
  amount: import_zod.z.number().positive().nullable().optional(),
  paid: import_zod.z.boolean().optional()
});
var toggleSharedStatusSchema = import_zod.z.object({
  value: import_zod.z.boolean()
});
var createTagSchema = import_zod.z.object({
  name: import_zod.z.string().min(1, "Name is required").max(30),
  color: import_zod.z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a hex value like #0891b2")
});
var updateTagSchema = import_zod.z.object({
  name: import_zod.z.string().min(1).max(30).optional(),
  color: import_zod.z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a hex value like #0891b2").optional()
});
var reorderBillsSchema = import_zod.z.object({
  orderedIds: import_zod.z.array(import_zod.z.string()).min(1)
});
var inviteConnectionSchema = import_zod.z.object({
  email: import_zod.z.string().email("Invalid email address")
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createBillSchema,
  createTagSchema,
  externalContactSchema,
  inviteConnectionSchema,
  reorderBillsSchema,
  toggleSharedStatusSchema,
  updateBillSchema,
  updateMonthlyBillSchema,
  updateTagSchema
});
