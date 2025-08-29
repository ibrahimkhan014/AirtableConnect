import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CloudUpload, File, X, Upload } from "lucide-react";
import type { AirtableConfig } from "@shared/schema";

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recordId: string;
  config: AirtableConfig;
  availableFields?: string[];
}

interface SelectedFile {
  file: File;
  name: string;
  size: string;
}

export default function UploadModal({ open, onOpenChange, recordId, config, availableFields = [] }: UploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Detect attachment fields from available fields, prioritizing image-specific fields
  const imageFields = availableFields.filter(field => {
    const fieldLower = field.toLowerCase();
    return fieldLower.includes('image') || 
           fieldLower.includes('photo') || 
           fieldLower.includes('picture') ||
           fieldLower.includes('screenshot') ||
           fieldLower.includes('pic');
  });

  const generalAttachmentFields = availableFields.filter(field => {
    const fieldLower = field.toLowerCase();
    return fieldLower.includes('attachment') || 
           fieldLower.includes('file') || 
           fieldLower.includes('document') ||
           fieldLower.includes('upload');
  });

  // Prioritize image fields first, then general attachment fields
  const attachmentFields = [...imageFields, ...generalAttachmentFields];
  const attachmentFieldName = attachmentFields[0] || "Attachments"; // fallback to "Attachments"

  const uploadMutation = useMutation({
    mutationFn: async ({ file, fieldName }: { file: File; fieldName: string }) => {
      // Convert file to base64 URL (simulating upload to a public URL)
      const formData = new FormData();
      formData.append("file", file);
      
      // For demo purposes, we'll create a mock URL
      // In a real app, you'd upload to a file service and get back a public URL
      const mockUrl = `https://example.com/uploads/${file.name}`;
      
      const response = await apiRequest("POST", `/api/airtable/${config.tableName}/${recordId}/attachment/${fieldName}`, {
        url: mockUrl,
        filename: file.name,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/airtable", config.tableName] });
      toast({
        title: "File Uploaded",
        description: "Attachment has been added to the record",
      });
      setSelectedFile(null);
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    },
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile({
      file,
      name: file.name,
      size: formatFileSize(file.size),
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    
    if (attachmentFields.length === 0) {
      toast({
        title: "No Attachment Field",
        description: "This table doesn't have any attachment fields to upload to",
        variant: "destructive",
      });
      return;
    }
    
    uploadMutation.mutate({ 
      file: selectedFile.file, 
      fieldName: attachmentFieldName 
    });
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="upload-modal">
        <DialogHeader>
          <DialogTitle>Upload Attachment</DialogTitle>
        </DialogHeader>
        
        {attachmentFields.length > 0 && (
          <div className="text-sm text-muted-foreground">
            File will be uploaded to: <span className="font-medium">{attachmentFieldName}</span>
          </div>
        )}
        
        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragging 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary"
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            data-testid="file-drop-zone"
          >
            <CloudUpload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-card-foreground font-medium">Click to upload or drag and drop</p>
            <p className="text-sm text-muted-foreground mt-1">PNG, JPG, PDF up to 10MB</p>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".png,.jpg,.jpeg,.pdf,.doc,.docx,.txt"
              onChange={handleFileInput}
              data-testid="file-input"
            />
          </div>
          
          {selectedFile && (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <File className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedFile.size}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10 p-1"
                  onClick={removeFile}
                  data-testid="button-remove-file"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-upload"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpload}
              disabled={!selectedFile || uploadMutation.isPending}
              data-testid="button-upload-file"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploadMutation.isPending ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
