import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { RefreshCw, Plus, Edit, Paperclip, Trash2, Search, Table } from "lucide-react";
import RecordForm from "./record-form";
import UploadModal from "./upload-modal";
import type { AirtableConfig, AirtableResponse, AirtableRecord } from "@shared/schema";

interface RecordsTableProps {
  config: AirtableConfig;
}

export default function RecordsTable({ config }: RecordsTableProps) {
  const [editingRecord, setEditingRecord] = useState<AirtableRecord | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadRecordId, setUploadRecordId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: airtableData, isLoading, error } = useQuery<AirtableResponse>({
    queryKey: ["/api/airtable", config.tableName],
    enabled: !!config.tableName,
  });

  const deleteRecordMutation = useMutation({
    mutationFn: async (recordId: string) => {
      const response = await apiRequest("DELETE", `/api/airtable/${config.tableName}/${recordId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/airtable", config.tableName] });
      toast({
        title: "Record Deleted",
        description: "The record has been removed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete record",
        variant: "destructive",
      });
    },
  });

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/airtable", config.tableName] });
    toast({
      title: "Data Refreshed",
      description: "Records have been updated from Airtable",
    });
  };

  const handleEdit = (record: AirtableRecord) => {
    setEditingRecord(record);
  };

  const handleUpload = (recordId: string) => {
    setUploadRecordId(recordId);
    setShowUploadModal(true);
  };

  const handleDelete = (recordId: string) => {
    deleteRecordMutation.mutate(recordId);
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower.includes("open")) {
      return <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">
        <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5"></div>
        {status}
      </Badge>;
    }
    if (statusLower.includes("progress")) {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1.5"></div>
        {status}
      </Badge>;
    }
    if (statusLower.includes("closed") || statusLower.includes("done")) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></div>
        {status}
      </Badge>;
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityLower = priority?.toLowerCase() || "";
    if (priorityLower.includes("high")) {
      return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">{priority}</Badge>;
    }
    if (priorityLower.includes("medium")) {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{priority}</Badge>;
    }
    if (priorityLower.includes("low")) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{priority}</Badge>;
    }
    return <Badge variant="secondary">{priority}</Badge>;
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500"];
    const hash = name?.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
    return colors[hash % colors.length];
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <span className="ml-3 text-muted-foreground">Loading records...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <h3 className="font-semibold mb-2">Error Loading Records</h3>
            <p className="text-sm">{(error as any).message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!airtableData?.records?.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Table className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No Records Found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This table appears to be empty. Create your first record to get started.
            </p>
            <Button onClick={() => setShowCreateForm(true)} data-testid="button-create-first-record">
              <Plus className="w-4 h-4 mr-2" />
              Create First Record
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const records = airtableData.records || [];
  const sampleRecord = records[0];
  const fieldNames = sampleRecord ? Object.keys(sampleRecord.fields) : [];

  const filteredRecords = records.filter(record => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return Object.values(record.fields).some(value => 
      String(value).toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-foreground">Records Management</h2>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Table className="w-4 h-4" />
            <span data-testid="text-record-count">{records.length} records</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline"
            onClick={refreshData}
            data-testid="button-refresh"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700" data-testid="button-create-record">
                <Plus className="w-4 h-4 mr-2" />
                Create New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Record</DialogTitle>
              </DialogHeader>
              <RecordForm
                fields={fieldNames}
                config={config}
                onSuccess={() => setShowCreateForm(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Data Table */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Table className="w-5 h-5 mr-2 text-primary" />
              {config.tableName} Records
            </CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                  data-testid="input-search"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        
        <div className="table-container max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-muted/50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
                  ID
                </th>
                {fieldNames.map((field) => (
                  <th
                    key={field}
                    className="px-6 py-3 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider border-b border-border"
                  >
                    {field}
                  </th>
                ))}
                <th className="px-6 py-3 text-center text-sm font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {filteredRecords.map((record, idx) => (
                <tr 
                  key={record.id}
                  className={`hover:bg-muted/30 transition-colors ${
                    idx % 2 === 0 ? "" : "bg-muted/10"
                  }`}
                  data-testid={`row-record-${record.id}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-muted-foreground">
                    {record.id.slice(-8)}
                  </td>
                  {fieldNames.map((field) => (
                    <td key={field} className="px-6 py-4 text-sm text-card-foreground">
                      {field.toLowerCase().includes("status") ? (
                        getStatusBadge(String(record.fields[field] || ""))
                      ) : field.toLowerCase().includes("priority") ? (
                        getPriorityBadge(String(record.fields[field] || ""))
                      ) : field.toLowerCase().includes("assignee") ? (
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium mr-3 ${
                            getAvatarColor(String(record.fields[field] || ""))
                          }`}>
                            {getInitials(String(record.fields[field] || ""))}
                          </div>
                          {String(record.fields[field] || "")}
                        </div>
                      ) : field.toLowerCase().includes("title") ? (
                        <div>
                          <div className="font-medium">{String(record.fields[field] || "")}</div>
                          {record.fields["Description"] && (
                            <div className="text-muted-foreground text-xs mt-1">
                              {String(record.fields["Description"]).slice(0, 50)}...
                            </div>
                          )}
                        </div>
                      ) : (
                        <span>{String(record.fields[field] || "")}</span>
                      )}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="p-1.5 hover:bg-blue-100 text-blue-600"
                        onClick={() => handleEdit(record)}
                        data-testid={`button-edit-${record.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="p-1.5 hover:bg-gray-100 text-gray-600"
                        onClick={() => handleUpload(record.id)}
                        data-testid={`button-upload-${record.id}`}
                      >
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="p-1.5 hover:bg-red-100 text-red-600"
                            data-testid={`button-delete-${record.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the record.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(record.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 border-t border-border bg-muted/30">
          <div className="text-sm text-muted-foreground">
            Showing {filteredRecords.length} of {records.length} records
          </div>
        </div>
      </Card>

      {/* Edit Modal */}
      <Dialog open={!!editingRecord} onOpenChange={(open) => !open && setEditingRecord(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Record</DialogTitle>
          </DialogHeader>
          {editingRecord && (
            <RecordForm
              fields={fieldNames}
              initialValues={editingRecord.fields}
              recordId={editingRecord.id}
              config={config}
              onSuccess={() => setEditingRecord(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Upload Modal */}
      <UploadModal
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
        recordId={uploadRecordId}
        config={config}
      />
    </div>
  );
}
