"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/app.ts
var app_exports = {};
__export(app_exports, {
  default: () => app_default
});
module.exports = __toCommonJS(app_exports);
var import_express5 = require("@clerk/express");
var import_cors = __toESM(require("cors"));
var import_express6 = __toESM(require("express"));

// src/favicon.ts
var faviconIco = Buffer.from(
  "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",
  "base64"
);

// ../../packages/shared/src/schemas.ts
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
  order: import_zod.z.number().int().min(0).default(0)
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
  order: import_zod.z.number().int().min(0).optional()
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
var inviteConnectionSchema = import_zod.z.object({
  email: import_zod.z.string().email("Invalid email address")
});

// src/routes/bills.ts
var import_express2 = require("express");
var import_mongodb3 = require("mongodb");

// src/lib/parse-id.ts
var import_mongodb = require("mongodb");
function parseId(param) {
  try {
    return new import_mongodb.ObjectId(param);
  } catch {
    return null;
  }
}

// src/middleware/requireAuth.ts
var import_express = require("@clerk/express");

// src/db/mongo.ts
var import_mongodb2 = require("mongodb");
var client;
var db;
async function getDb() {
  if (db) return db;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI environment variable is required");
  const dbName = process.env.MONGODB_DB ?? "contas";
  client = new import_mongodb2.MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  return db;
}

// src/repos/users.ts
async function getCollection() {
  const db2 = await getDb();
  return db2.collection("users");
}
async function upsertByClerkUserId(clerkUserId, opts) {
  const col = await getCollection();
  const setOnInsert = {
    clerkUserId,
    createdAt: /* @__PURE__ */ new Date()
  };
  const setFields = {};
  if (opts?.email !== void 0) setFields.email = opts.email;
  if (opts?.name !== void 0) setFields.name = opts.name;
  const update3 = { $setOnInsert: setOnInsert };
  if (Object.keys(setFields).length > 0) {
    update3.$set = setFields;
  }
  try {
    const result = await col.findOneAndUpdate({ clerkUserId }, update3, {
      upsert: true,
      returnDocument: "after"
    });
    return result;
  } catch (err) {
    if (typeof err === "object" && err !== null && "code" in err && err.code === 11e3) {
      const existing = await col.findOne({ clerkUserId });
      return existing;
    }
    throw err;
  }
}
async function findByEmail(email) {
  const col = await getCollection();
  return col.findOne({ email });
}

// src/middleware/requireAuth.ts
var USER_CACHE_TTL = 5 * 60 * 1e3;
var userCache = /* @__PURE__ */ new Map();
var requireAuth = async (req, res, next) => {
  const { userId } = (0, import_express.getAuth)(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const cached = userCache.get(userId);
    if (cached && cached.expiresAt > Date.now()) {
      req.user = {
        id: cached.user._id.toHexString(),
        clerkUserId: cached.user.clerkUserId,
        email: cached.user.email
      };
      return next();
    }
    const clerkUser = await import_express.clerkClient.users.getUser(userId);
    const email = clerkUser.emailAddresses[0]?.emailAddress;
    const dbUser = await upsertByClerkUserId(userId, { email });
    userCache.set(userId, { user: dbUser, expiresAt: Date.now() + USER_CACHE_TTL });
    req.user = {
      id: dbUser._id.toHexString(),
      clerkUserId: dbUser.clerkUserId,
      email: dbUser.email
    };
    next();
  } catch (err) {
    next(err);
  }
};

// src/middleware/validate.ts
function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: "Validation error", issues: result.error.flatten() });
      return;
    }
    req.body = result.data;
    next();
  };
}

// src/db/utils.ts
function buildMongoUpdate(patch) {
  const set = {};
  const unset = {};
  for (const [key, value] of Object.entries(patch)) {
    if (value === null || value === void 0) unset[key] = 1;
    else set[key] = value;
  }
  const op = {};
  if (Object.keys(set).length) op.$set = set;
  if (Object.keys(unset).length) op.$unset = unset;
  return op;
}

// src/repos/bills.ts
async function getCollection2() {
  const db2 = await getDb();
  return db2.collection("bills");
}
async function listActiveByUser(userId) {
  const col = await getCollection2();
  return col.find({ userId, active: true }).sort({ order: 1, createdAt: 1 }).toArray();
}
async function create(userId, data) {
  const col = await getCollection2();
  const doc = {
    userId,
    ...data,
    createdAt: /* @__PURE__ */ new Date()
  };
  const result = await col.insertOne(doc);
  return { ...doc, _id: result.insertedId };
}
async function update(id, userId, patch) {
  const col = await getCollection2();
  return col.findOneAndUpdate(
    { _id: id, userId },
    buildMongoUpdate(patch),
    { returnDocument: "after" }
  );
}
async function findByIds(ids) {
  if (ids.length === 0) return [];
  const col = await getCollection2();
  return col.find({ _id: { $in: ids } }).toArray();
}
async function softDelete(id, userId) {
  const col = await getCollection2();
  return col.findOneAndUpdate(
    { _id: id, userId },
    { $set: { active: false } },
    { returnDocument: "after" }
  );
}

// src/routes/bills.ts
var router = (0, import_express2.Router)();
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const userId = new import_mongodb3.ObjectId(req.user.id);
    const bills = await listActiveByUser(userId);
    res.json({ bills });
  } catch (err) {
    next(err);
  }
});
router.post("/", requireAuth, validateBody(createBillSchema), async (req, res, next) => {
  try {
    const userId = new import_mongodb3.ObjectId(req.user.id);
    const body = req.body;
    const bill = await create(userId, {
      name: body.name,
      amount: body.amount,
      where: body.where,
      notes: body.notes,
      isShared: body.isShared,
      sharedWithUserId: body.sharedWithUserId ? new import_mongodb3.ObjectId(body.sharedWithUserId) : void 0,
      externalContact: body.externalContact,
      splitType: body.splitType,
      customSplitAmount: body.customSplitAmount,
      payerUserId: body.payerUserId ? new import_mongodb3.ObjectId(body.payerUserId) : body.isShared ? userId : void 0,
      active: true,
      order: body.order
    });
    res.status(201).json({ bill });
  } catch (err) {
    next(err);
  }
});
router.put("/:id", requireAuth, validateBody(updateBillSchema), async (req, res, next) => {
  try {
    const userId = new import_mongodb3.ObjectId(req.user.id);
    const id = parseId(req.params.id);
    if (!id) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    const body = req.body;
    const patch = { ...body };
    if (typeof patch.sharedWithUserId === "string") {
      patch.sharedWithUserId = new import_mongodb3.ObjectId(patch.sharedWithUserId);
    }
    if (typeof patch.payerUserId === "string") {
      patch.payerUserId = new import_mongodb3.ObjectId(patch.payerUserId);
    }
    const bill = await update(id, userId, patch);
    if (!bill) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({ bill });
  } catch (err) {
    next(err);
  }
});
router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const userId = new import_mongodb3.ObjectId(req.user.id);
    const id = parseId(req.params.id);
    if (!id) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    const bill = await softDelete(id, userId);
    if (!bill) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
var bills_default = router;

// src/routes/connections.ts
var import_express3 = require("express");
var import_mongodb4 = require("mongodb");

// src/repos/connections.ts
async function getCollection3() {
  const db2 = await getDb();
  return db2.collection("connections");
}
async function listAcceptedForUser(userId) {
  const col = await getCollection3();
  return col.find({ status: "accepted", $or: [{ fromUserId: userId }, { toUserId: userId }] }).toArray();
}
async function listPendingForUser(userId) {
  const col = await getCollection3();
  return col.find({ toUserId: userId, status: "pending" }).toArray();
}
async function listSentByUser(userId) {
  const col = await getCollection3();
  return col.find({ fromUserId: userId, status: "pending" }).toArray();
}
async function findById(id) {
  const col = await getCollection3();
  return col.findOne({ _id: id });
}
async function findBetweenUsers(fromUserId, toUserId) {
  const col = await getCollection3();
  return col.findOne({
    $or: [
      { fromUserId, toUserId },
      { fromUserId: toUserId, toUserId: fromUserId }
    ]
  });
}
async function create2(data) {
  const col = await getCollection3();
  const now = /* @__PURE__ */ new Date();
  const doc = { ...data, createdAt: now, updatedAt: now };
  const result = await col.insertOne(doc);
  return { ...doc, _id: result.insertedId };
}
async function updateStatus(id, status) {
  const col = await getCollection3();
  return col.findOneAndUpdate(
    { _id: id },
    { $set: { status, updatedAt: /* @__PURE__ */ new Date() } },
    { returnDocument: "after" }
  );
}

// src/routes/connections.ts
var router2 = (0, import_express3.Router)();
router2.get("/", requireAuth, async (req, res, next) => {
  try {
    const userId = new import_mongodb4.ObjectId(req.user.id);
    const accepted = await listAcceptedForUser(userId);
    const pending = await listPendingForUser(userId);
    const sent = await listSentByUser(userId);
    res.json({ accepted, pending, sent });
  } catch (err) {
    next(err);
  }
});
router2.post(
  "/invite",
  requireAuth,
  validateBody(inviteConnectionSchema),
  async (req, res, next) => {
    try {
      const fromUserId = new import_mongodb4.ObjectId(req.user.id);
      const fromEmail = req.user.email ?? "";
      const { email: toEmail } = req.body;
      if (toEmail.toLowerCase() === fromEmail.toLowerCase()) {
        res.status(400).json({ error: "Cannot invite yourself" });
        return;
      }
      const toUser = await findByEmail(toEmail);
      if (!toUser) {
        res.status(404).json({ error: "User not found. They need to sign up first." });
        return;
      }
      const existing = await findBetweenUsers(fromUserId, toUser._id);
      if (existing) {
        res.status(409).json({ error: "Connection already exists", connection: existing });
        return;
      }
      const connection = await create2({
        fromUserId,
        toUserId: toUser._id,
        fromEmail,
        toEmail: toUser.email ?? toEmail,
        status: "pending"
      });
      res.status(201).json({ connection });
    } catch (err) {
      next(err);
    }
  }
);
function makeStatusHandler(targetStatus) {
  return async (req, res, next) => {
    try {
      const userId = new import_mongodb4.ObjectId(req.user.id);
      const id = parseId(req.params.id);
      if (!id) {
        res.status(400).json({ error: "Invalid ID" });
        return;
      }
      const connection = await findById(id);
      if (!connection) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      if (!connection.toUserId.equals(userId)) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      if (connection.status !== "pending") {
        res.status(400).json({ error: `Connection is already ${connection.status}` });
        return;
      }
      const updated = await updateStatus(id, targetStatus);
      res.json({ connection: updated });
    } catch (err) {
      next(err);
    }
  };
}
router2.put("/:id/accept", requireAuth, makeStatusHandler("accepted"));
router2.put("/:id/reject", requireAuth, makeStatusHandler("rejected"));
var connections_default = router2;

// src/routes/months.ts
var import_express4 = require("express");
var import_mongodb5 = require("mongodb");

// src/repos/months.ts
async function getCollection4() {
  const db2 = await getDb();
  return db2.collection("monthlyBills");
}
async function listByUserAndMonth(userId, year, month) {
  const col = await getCollection4();
  return col.find({ userId, year, month }).toArray();
}
async function findByBillAndMonth(billId, userId, year, month) {
  const col = await getCollection4();
  return col.findOne({ billId, userId, year, month });
}
async function insertMany(docs) {
  if (docs.length === 0) return [];
  const col = await getCollection4();
  const result = await col.insertMany(docs);
  return docs.map((doc, i) => ({ ...doc, _id: result.insertedIds[i] }));
}
async function update2(id, userId, patch) {
  const col = await getCollection4();
  return col.findOneAndUpdate(
    { _id: id, userId },
    buildMongoUpdate(patch),
    { returnDocument: "after" }
  );
}
async function updateSharedPaid(billId, userId, year, month) {
  const col = await getCollection4();
  return col.findOneAndUpdate(
    { billId, userId, year, month },
    { $set: { "sharedData.otherPaidAt": /* @__PURE__ */ new Date() } },
    { returnDocument: "after" }
  );
}
async function updateSharedConfirm(billId, userId, year, month) {
  const col = await getCollection4();
  return col.findOneAndUpdate(
    { billId, userId, year, month },
    { $set: { "sharedData.payerConfirmedAt": /* @__PURE__ */ new Date() } },
    { returnDocument: "after" }
  );
}

// src/routes/months.ts
var router3 = (0, import_express4.Router)();
function buildMonthlyDoc(bill, userId, year, month) {
  const base = { billId: bill._id, userId, year, month, amount: bill.amount };
  if (!bill.isShared || !bill.sharedWithUserId) return base;
  const otherAmount = bill.splitType === "custom" && bill.customSplitAmount !== void 0 ? bill.customSplitAmount : (bill.amount ?? 0) / 2;
  return { ...base, sharedData: { otherUserId: bill.sharedWithUserId, otherAmount } };
}
async function ensureMonthInitialized(userId, year, month) {
  const [existing, activeBills] = await Promise.all([
    listByUserAndMonth(userId, year, month),
    listActiveByUser(userId)
  ]);
  if (activeBills.length === 0) return existing;
  const coveredIds = new Set(existing.map((mb) => mb.billId.toHexString()));
  const missing = activeBills.filter((b) => !coveredIds.has(b._id.toHexString()));
  if (missing.length === 0) return existing;
  const newDocs = missing.map((bill) => buildMonthlyDoc(bill, userId, year, month));
  const created = await insertMany(newDocs);
  return [...existing, ...created];
}
function makeSharedHandler(repoMethod) {
  return async (req, res, next) => {
    try {
      const userId = new import_mongodb5.ObjectId(req.user.id);
      const year = parseInt(req.params.year, 10);
      const month = parseInt(req.params.month, 10);
      const billId = parseId(req.params.billId);
      if (!billId || Number.isNaN(year) || Number.isNaN(month)) {
        res.status(400).json({ error: "Invalid parameters" });
        return;
      }
      const updated = await repoMethod(billId, userId, year, month);
      if (!updated) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json({ monthlyBill: updated });
    } catch (err) {
      next(err);
    }
  };
}
router3.get("/:year/:month", requireAuth, async (req, res, next) => {
  try {
    const userId = new import_mongodb5.ObjectId(req.user.id);
    const year = parseInt(req.params.year, 10);
    const month = parseInt(req.params.month, 10);
    if (Number.isNaN(year) || Number.isNaN(month) || month < 1 || month > 12) {
      res.status(400).json({ error: "Invalid year or month" });
      return;
    }
    const monthlyBills = await ensureMonthInitialized(userId, year, month);
    const uniqueBillIds = [...new Set(monthlyBills.map((mb) => mb.billId.toHexString()))].map(
      (id) => new import_mongodb5.ObjectId(id)
    );
    const bills = await findByIds(uniqueBillIds);
    const billMap = new Map(bills.map((b) => [b._id.toHexString(), b]));
    const result = monthlyBills.map((mb) => ({
      ...mb,
      bill: billMap.get(mb.billId.toHexString())
    }));
    res.json({ monthlyBills: result, year, month });
  } catch (err) {
    next(err);
  }
});
router3.put(
  "/:year/:month/:billId",
  requireAuth,
  validateBody(updateMonthlyBillSchema),
  async (req, res, next) => {
    try {
      const userId = new import_mongodb5.ObjectId(req.user.id);
      const year = parseInt(req.params.year, 10);
      const month = parseInt(req.params.month, 10);
      const billId = parseId(req.params.billId);
      if (!billId || Number.isNaN(year) || Number.isNaN(month)) {
        res.status(400).json({ error: "Invalid parameters" });
        return;
      }
      const existing = await findByBillAndMonth(billId, userId, year, month);
      if (!existing) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      const { amount, paid } = req.body;
      const patch = {};
      if (amount !== void 0) patch.amount = amount ?? void 0;
      if (paid !== void 0) patch.paidAt = paid ? /* @__PURE__ */ new Date() : void 0;
      const updated = await update2(existing._id, userId, patch);
      res.json({ monthlyBill: updated });
    } catch (err) {
      next(err);
    }
  }
);
router3.post(
  "/:year/:month/:billId/shared-paid",
  requireAuth,
  makeSharedHandler(updateSharedPaid)
);
router3.post(
  "/:year/:month/:billId/shared-confirm",
  requireAuth,
  makeSharedHandler(updateSharedConfirm)
);
var months_default = router3;

// src/app.ts
var app = (0, import_express6.default)();
app.use(
  (0, import_cors.default)({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
    credentials: true
  })
);
app.use(import_express6.default.json());
app.use((0, import_express5.clerkMiddleware)());
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
app.get("/favicon.ico", (_req, res) => {
  res.type("image/x-icon").send(faviconIco);
});
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    time: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.use("/api/bills", bills_default);
app.use("/api/months", months_default);
app.use("/api/connections", connections_default);
app.use(
  (err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
);
var app_default = app;
