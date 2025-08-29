import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Save, Plus } from "lucide-react";
import type { AirtableConfig } from "@shared/schema";

interface RecordFormProps {
  fields: string[];
  config: AirtableConfig;
  initialValues?: Record<string, any>;
  recordId?: string;
  onSuccess: () => void;
}

export default function RecordForm({ fields, config, initialValues = {}, recordId, onSuccess }: RecordFormProps) {
  const [formData, setFormData] = useState(initialValues);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!recordId;

  // Filter out read-only/computed fields that cannot be edited
  const isReadOnlyField = (field: string) => {
    const fieldLower = field.toLowerCase();
    
    // Comprehensive list of patterns for read-only fields
    const readOnlyPatterns = [
      // AI and computed fields
      /ai/i, /summary/i, /formula/i, /computed/i, /calculated/i,
      
      // Counting and mathematical fields
      /number of/i, /count/i, /total/i, /sum/i, /average/i, /max/i, /min/i,
      
      // Time-based computed fields
      /days? (open|since|elapsed)/i, /time elapsed/i, /duration/i,
      /created time/i, /created by/i, /last modified/i, /modified by/i,
      
      // Attachment and media fields
      /photo/i, /image/i, /picture/i, /attachment/i, /file/i, /document/i,
      
      // Lookup and reference fields
      /rollup/i, /lookup/i, /reference/i,
      
      // Auto-generated fields
      /auto number/i, /barcode/i, /autonumber/i,
      
      // Status and severity fields (often computed)
      /severity/i, /priority level/i, /bug severity/i,
      /bug status/i, /status update/i, /current status/i,
      /comment sentiment/i, /sentiment/i, /author role/i,
      
      // Other computed patterns
      /\([^)]*\)/i,  // Fields with parentheses often indicate formulas
    ];
    
    return readOnlyPatterns.some(pattern => pattern.test(field));
  };

  const editableFields = fields.filter(field => !isReadOnlyField(field));

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const response = await apiRequest("POST", `/api/airtable/${config.tableName}`, {
        fields: data,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/airtable", config.tableName] });
      toast({
        title: "Record Created",
        description: "New record has been added successfully",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create record",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const response = await apiRequest("PATCH", `/api/airtable/${config.tableName}/${recordId}`, {
        fields: data,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/airtable", config.tableName] });
      toast({
        title: "Record Updated",
        description: "Changes have been saved successfully",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update record",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only send editable fields with valid values to prevent API errors
    const editableData = Object.keys(formData)
      .filter(key => !isReadOnlyField(key))
      .reduce((obj, key) => {
        const value = formData[key];
        // Only include fields with non-empty, valid values
        if (value !== null && value !== undefined && value !== '') {
          // Trim strings to remove whitespace
          obj[key] = typeof value === 'string' ? value.trim() : value;
        }
        return obj;
      }, {} as Record<string, any>);
    
    // Ensure we have at least one field to update/create
    if (Object.keys(editableData).length === 0) {
      toast({
        title: "No Data to Save",
        description: "Please fill in at least one field before saving",
        variant: "destructive",
      });
      return;
    }
    
    // Debug logging to help identify problematic fields
    console.log('Filtered fields being sent:', Object.keys(editableData));
    console.log('All original fields:', fields);
    console.log('Read-only fields filtered out:', fields.filter(field => isReadOnlyField(field)));
    
    if (isEditing) {
      updateMutation.mutate(editableData);
    } else {
      createMutation.mutate(editableData);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getFieldInput = (field: string) => {
    const fieldLower = field.toLowerCase();
    const value = formData[field] || "";

    if (fieldLower.includes("status")) {
      return (
        <Select value={value} onValueChange={(value) => handleChange(field, value)}>
          <SelectTrigger data-testid={`select-${field.toLowerCase()}`}>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      );
    }

    if (fieldLower.includes("priority")) {
      return (
        <Select value={value} onValueChange={(value) => handleChange(field, value)}>
          <SelectTrigger data-testid={`select-${field.toLowerCase()}`}>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
          </SelectContent>
        </Select>
      );
    }

    if (fieldLower.includes("description") || fieldLower.includes("notes")) {
      return (
        <Textarea
          value={value}
          onChange={(e) => handleChange(field, e.target.value)}
          placeholder={`Enter ${field.toLowerCase()}`}
          className="h-20 resize-none"
          data-testid={`textarea-${field.toLowerCase()}`}
        />
      );
    }

    return (
      <Input
        value={value}
        onChange={(e) => handleChange(field, e.target.value)}
        placeholder={`Enter ${field.toLowerCase()}`}
        data-testid={`input-${field.toLowerCase()}`}
      />
    );
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="record-form">
      {editableFields.map((field) => (
        <div key={field} className="space-y-2">
          <Label htmlFor={field}>
            {field}
            {field.toLowerCase().includes("title") && (
              <span className="text-destructive ml-1">*</span>
            )}
          </Label>
          {getFieldInput(field)}
        </div>
      ))}
      
      {editableFields.length === 0 && (
        <div className="text-center py-4 text-muted-foreground">
          No editable fields available in this table.
        </div>
      )}
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onSuccess}
          data-testid="button-cancel"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
          className={isEditing ? "" : "bg-green-600 hover:bg-green-700"}
          data-testid="button-submit"
        >
          {isEditing ? (
            <>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? "Saving..." : "Save Changes"}
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              {isLoading ? "Creating..." : "Create Record"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
