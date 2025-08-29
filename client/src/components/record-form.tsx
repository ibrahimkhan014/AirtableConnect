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
    const readOnlyKeywords = [
      'ai', 'summary', 'formula', 'count', 'rollup', 'lookup',
      'created time', 'created by', 'last modified time', 'last modified by',
      'auto number', 'barcode', 'calculated', 'computation'
    ];
    
    return readOnlyKeywords.some(keyword => fieldLower.includes(keyword));
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
    
    // Only send editable fields to prevent API errors
    const editableData = Object.keys(formData)
      .filter(key => !isReadOnlyField(key))
      .reduce((obj, key) => {
        obj[key] = formData[key];
        return obj;
      }, {} as Record<string, any>);
    
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
