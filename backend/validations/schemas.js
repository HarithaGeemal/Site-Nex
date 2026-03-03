import { z } from "zod";
import mongoose from "mongoose";

// Custom Zod validation for MongoDB ObjectId
const objectId = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId format",
});

// ----------------------------------------
// Common
// ----------------------------------------
export const idParamSchema = z.object({
    id: objectId,
});

export const projectIdParamSchema = z.object({
    projectId: objectId,
});

export const taskParamSchema = z.object({
    projectId: objectId,
    taskId: objectId,
});

// ----------------------------------------
// Users
// ----------------------------------------
export const registerUserSchema = z.object({
    userId: z.string().min(1),
    name: z.string().min(1),
    email: z.string().email(),
    userRole: z.enum(["ADMIN", "PROJECT_MANAGER", "SITE_ENGINEER", "ASSISTANT_ENGINEER", "STORE_KEEPER"]),
    phone: z.string().optional(),
    nic: z.string().optional(),
});

export const updateProfileSchema = z.object({
    name: z.string().min(1).optional(),
    phone: z.string().optional(),
    nic: z.string().optional(),
});

export const syncUserSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
});

// ----------------------------------------
// Projects
// ----------------------------------------
export const createProjectSchema = z.object({
    name: z.string().min(1),
    location: z.string().min(1),
    startDate: z.string().datetime() || z.string(), // ISO string
    endDate: z.string().datetime() || z.string(),
    description: z.string().optional(),
    budget: z.number().min(0).optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

// ----------------------------------------
// Tasks
// ----------------------------------------
export const createTaskSchema = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    status: z.enum(["Pending", "In Progress", "Completed", "On Hold", "Cancelled"]).optional(),
    priority: z.enum(["Low", "Medium", "High", "Critical"]).optional(),
    startDate: z.string(),
    endDate: z.string(),
    percentComplete: z.number().min(0).max(100).optional(),
    dependencyTaskIds: z.array(objectId).optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

// ----------------------------------------
// Issues
// ----------------------------------------
export const createIssueSchema = z.object({
    taskId: objectId.optional(),
    title: z.string().min(1),
    description: z.string().min(1),
    type: z.enum(["Defect", "Safety", "Material Shortage", "Design Request", "Other"]),
    priority: z.enum(["Low", "Medium", "High", "Critical"]),
});

// ----------------------------------------
// Materials
// ----------------------------------------
export const createMaterialItemSchema = z.object({
    name: z.string().min(1),
    category: z.string().min(1).optional(),
    unit: z.string().min(1),
    defaultUnitCost: z.number().min(0).optional(),
    minStockThreshold: z.number().min(0).optional(),
});
export const addStockMovementSchema = z.object({
    materialItemId: objectId,
    type: z.enum(["STOCK_IN", "ADJUSTMENT"]),
    quantity: z.number(),
    supplier: z.string().optional(),
    deliveryDate: z.string().optional(),
    unitCost: z.number().optional(),
    note: z.string().optional()
});

export const logUsageSchema = z.object({
    taskId: objectId,
    materialItemId: objectId,
    quantityUsed: z.number().positive(),
    usageDate: z.string()
});
