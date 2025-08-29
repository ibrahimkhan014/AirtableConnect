import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AirtableConfig from "@/components/airtable-config";
import RecordsTable from "@/components/records-table";
import { Database, Settings, Wifi } from "lucide-react";
import type { AirtableConfig as AirtableConfigType } from "@shared/schema";

export default function Dashboard() {
  const [config, setConfig] = useState<AirtableConfigType | null>(null);

  const { data: savedConfig, isLoading } = useQuery({
    queryKey: ["/api/airtable/config"],
    enabled: !config,
  });

  const handleConfigSaved = (newConfig: AirtableConfigType) => {
    setConfig(newConfig);
  };

  const isConfigured = config || savedConfig;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Database className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Airtable Integration</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  isConfigured ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span>{isConfigured ? 'Connected' : 'Disconnected'}</span>
              </div>
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <Settings className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="space-y-8">
          <AirtableConfig 
            onConfigSaved={handleConfigSaved}
            initialConfig={savedConfig}
          />
          
          {isConfigured && (
            <RecordsTable config={config || savedConfig} />
          )}
        </div>
      </main>
    </div>
  );
}
