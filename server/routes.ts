import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  airtableConfigSchema, 
  createRecordSchema, 
  updateRecordSchema,
  uploadAttachmentSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Save Airtable configuration
  app.post("/api/airtable/config", async (req, res) => {
    try {
      const config = airtableConfigSchema.parse(req.body);
      await storage.saveAirtableConfig(config);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get Airtable configuration
  app.get("/api/airtable/config", async (req, res) => {
    try {
      const config = await storage.getAirtableConfig();
      res.json(config || null);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all records from Airtable
  app.get("/api/airtable/:tableName", async (req, res) => {
    try {
      const config = await storage.getAirtableConfig();
      if (!config) {
        return res.status(400).json({ error: "Airtable not configured" });
      }

      const { tableName } = req.params;
      const response = await fetch(
        `https://api.airtable.com/v0/${config.baseId}/${tableName}`,
        {
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ 
          error: `Airtable API error: ${errorText}` 
        });
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create a new record
  app.post("/api/airtable/:tableName", async (req, res) => {
    try {
      const config = await storage.getAirtableConfig();
      if (!config) {
        return res.status(400).json({ error: "Airtable not configured" });
      }

      const { tableName } = req.params;
      const recordData = createRecordSchema.parse(req.body);

      const response = await fetch(
        `https://api.airtable.com/v0/${config.baseId}/${tableName}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(recordData),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ 
          error: `Airtable API error: ${errorText}` 
        });
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Update a record
  app.patch("/api/airtable/:tableName/:recordId", async (req, res) => {
    try {
      const config = await storage.getAirtableConfig();
      if (!config) {
        return res.status(400).json({ error: "Airtable not configured" });
      }

      const { tableName, recordId } = req.params;
      const recordData = updateRecordSchema.parse(req.body);

      const response = await fetch(
        `https://api.airtable.com/v0/${config.baseId}/${tableName}/${recordId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(recordData),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ 
          error: `Airtable API error: ${errorText}` 
        });
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Delete a record
  app.delete("/api/airtable/:tableName/:recordId", async (req, res) => {
    try {
      const config = await storage.getAirtableConfig();
      if (!config) {
        return res.status(400).json({ error: "Airtable not configured" });
      }

      const { tableName, recordId } = req.params;

      const response = await fetch(
        `https://api.airtable.com/v0/${config.baseId}/${tableName}/${recordId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ 
          error: `Airtable API error: ${errorText}` 
        });
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Upload attachment
  app.post("/api/airtable/:tableName/:recordId/attachment/:fieldName", async (req, res) => {
    try {
      const config = await storage.getAirtableConfig();
      if (!config) {
        return res.status(400).json({ error: "Airtable not configured" });
      }

      const { tableName, recordId, fieldName } = req.params;
      const attachmentData = uploadAttachmentSchema.parse(req.body);

      const response = await fetch(
        `https://api.airtable.com/v0/${config.baseId}/${tableName}/${recordId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fields: {
              [fieldName]: [attachmentData],
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ 
          error: `Airtable API error: ${errorText}` 
        });
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
