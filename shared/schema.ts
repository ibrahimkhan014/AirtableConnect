import { z } from "zod";

export const airtableConfigSchema = z.object({
  apiKey: z.string().min(1, "API Key is required"),
  baseId: z.string().min(1, "Base ID is required"),
  tableName: z.string().min(1, "Table Name is required"),
});

export const airtableRecordSchema = z.object({
  id: z.string(),
  fields: z.record(z.any()),
  createdTime: z.string().optional(),
});

export const airtableResponseSchema = z.object({
  records: z.array(airtableRecordSchema),
  offset: z.string().optional(),
});

export const createRecordSchema = z.object({
  fields: z.record(z.any()),
});

export const updateRecordSchema = z.object({
  fields: z.record(z.any()),
});

export const uploadAttachmentSchema = z.object({
  url: z.string().url(),
  filename: z.string().optional(),
});

export type AirtableConfig = z.infer<typeof airtableConfigSchema>;
export type AirtableRecord = z.infer<typeof airtableRecordSchema>;
export type AirtableResponse = z.infer<typeof airtableResponseSchema>;
export type CreateRecord = z.infer<typeof createRecordSchema>;
export type UpdateRecord = z.infer<typeof updateRecordSchema>;
export type UploadAttachment = z.infer<typeof uploadAttachmentSchema>;
