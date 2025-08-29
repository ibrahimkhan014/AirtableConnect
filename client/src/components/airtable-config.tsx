import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Save, Trash2, Eye, EyeOff } from "lucide-react";
import type { AirtableConfig as AirtableConfigType } from "@shared/schema";

interface AirtableConfigProps {
  onConfigSaved: (config: AirtableConfigType) => void;
  initialConfig?: AirtableConfigType | null;
}

export default function AirtableConfig({ onConfigSaved, initialConfig }: AirtableConfigProps) {
  const [apiKey, setApiKey] = useState("");
  const [baseId, setBaseId] = useState("");
  const [tableName, setTableName] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (initialConfig) {
      setApiKey(initialConfig.apiKey);
      setBaseId(initialConfig.baseId);
      setTableName(initialConfig.tableName);
    }
  }, [initialConfig]);

  const saveConfigMutation = useMutation({
    mutationFn: async (config: AirtableConfigType) => {
      const response = await apiRequest("POST", "/api/airtable/config", config);
      return response.json();
    },
    onSuccess: () => {
      const config = { apiKey, baseId, tableName };
      onConfigSaved(config);
      queryClient.invalidateQueries({ queryKey: ["/api/airtable/config"] });
      toast({
        title: "Configuration Saved",
        description: "Successfully connected to Airtable",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save configuration",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!apiKey || !baseId || !tableName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    saveConfigMutation.mutate({ apiKey, baseId, tableName });
  };

  const handleClear = () => {
    setApiKey("");
    setBaseId("");
    setTableName("");
    onConfigSaved({ apiKey: "", baseId: "", tableName: "" });
    toast({
      title: "Configuration Cleared",
      description: "All settings have been removed",
    });
  };

  return (
    <Card className="w-full max-w-md" data-testid="airtable-config-card">
      <CardHeader>
        <CardTitle>Airtable Configuration</CardTitle>
        <CardDescription>Enter your Airtable credentials to get started</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="apiKey">API Key</Label>
          <div className="relative">
            <Input
              id="apiKey"
              type={showApiKey ? "text" : "password"}
              placeholder="patXXXXXXXXXXXXXX"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              data-testid="input-api-key"
            />
            <button
              type="button"
              className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              onClick={() => setShowApiKey(!showApiKey)}
              data-testid="button-toggle-api-key"
            >
              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="baseId">Base ID</Label>
          <Input
            id="baseId"
            placeholder="appXXXXXXXXXXXXXX"
            value={baseId}
            onChange={(e) => setBaseId(e.target.value)}
            data-testid="input-base-id"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tableName">Table Name</Label>
          <Input
            id="tableName"
            placeholder="Table 1"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            data-testid="input-table-name"
          />
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={handleSave}
            disabled={saveConfigMutation.isPending}
            className="flex-1"
            data-testid="button-save-config"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveConfigMutation.isPending ? "Saving..." : "Save & Fetch"}
          </Button>
          <Button 
            variant="outline"
            onClick={handleClear}
            data-testid="button-clear-config"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
