import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { 
  Download,
  FileText,
  Calendar as CalendarIcon,
  Filter,
  CheckCircle,
  Clock,
  File
} from "lucide-react";

interface ExportOptions {
  format: 'pdf' | 'csv' | 'txt' | 'json';
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  includeMetadata: boolean;
  includeConfidence: boolean;
  includeTimestamps: boolean;
  selectedConversations: string[];
}

interface Conversation {
  id: string;
  customerMessage: string;
  aiResponse: string;
  tone: string;
  confidence: number;
  createdAt: string;
  responseTime: number;
}

export default function ExportConversations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    dateRange: { from: null, to: null },
    includeMetadata: true,
    includeConfidence: true,
    includeTimestamps: true,
    selectedConversations: []
  });
  const [selectAll, setSelectAll] = useState(false);

  // Fetch conversations for export
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['/api/conversations/export'],
    enabled: !!user
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: (options: ExportOptions) => apiRequest("POST", "/api/conversations/export", options),
    onSuccess: (response: any) => {
      // Create download link
      const blob = new Blob([response.data], { type: response.contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = response.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: "Your conversations have been exported successfully"
      });
    },
    onError: () => {
      toast({
        title: "Export Failed",
        description: "Failed to export conversations",
        variant: "destructive"
      });
    }
  });

  const handleSelectAll = () => {
    if (selectAll) {
      setExportOptions(prev => ({ ...prev, selectedConversations: [] }));
    } else {
      setExportOptions(prev => ({ 
        ...prev, 
        selectedConversations: conversations.map((conv: Conversation) => conv.id)
      }));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectConversation = (conversationId: string) => {
    setExportOptions(prev => ({
      ...prev,
      selectedConversations: prev.selectedConversations.includes(conversationId)
        ? prev.selectedConversations.filter(id => id !== conversationId)
        : [...prev.selectedConversations, conversationId]
    }));
  };

  const handleExport = () => {
    if (exportOptions.selectedConversations.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one conversation to export",
        variant: "destructive"
      });
      return;
    }

    exportMutation.mutate(exportOptions);
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return <File className="w-4 h-4 text-red-500" />;
      case 'csv': return <File className="w-4 h-4 text-green-500" />;
      case 'txt': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'json': return <File className="w-4 h-4 text-purple-500" />;
      default: return <Download className="w-4 h-4" />;
    }
  };

  const filteredConversations = conversations.filter((conv: Conversation) => {
    const convDate = new Date(conv.createdAt);
    const fromDate = exportOptions.dateRange.from;
    const toDate = exportOptions.dateRange.to;

    if (fromDate && convDate < fromDate) return false;
    if (toDate && convDate > toDate) return false;
    
    return true;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white">
          Export Conversations
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Download your conversation history in various formats
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Export Options */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Export Options
              </CardTitle>
              <CardDescription>
                Configure your export settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Format Selection */}
              <div>
                <label className="text-sm font-medium mb-3 block">Export Format</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'pdf', label: 'PDF', desc: 'Formatted document' },
                    { value: 'csv', label: 'CSV', desc: 'Spreadsheet data' },
                    { value: 'txt', label: 'TXT', desc: 'Plain text' },
                    { value: 'json', label: 'JSON', desc: 'Structured data' }
                  ].map((format) => (
                    <button
                      key={format.value}
                      onClick={() => setExportOptions(prev => ({ ...prev, format: format.value as any }))}
                      className={`p-3 border rounded-lg text-left transition-colors ${
                        exportOptions.format === format.value
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {getFormatIcon(format.value)}
                        <span className="font-medium">{format.label}</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {format.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="text-sm font-medium mb-3 block">Date Range</label>
                <div className="space-y-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {exportOptions.dateRange.from ? (
                          format(exportOptions.dateRange.from, "PPP")
                        ) : (
                          "Start date"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={exportOptions.dateRange.from || undefined}
                        onSelect={(date) => 
                          setExportOptions(prev => ({
                            ...prev,
                            dateRange: { ...prev.dateRange, from: date || null }
                          }))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {exportOptions.dateRange.to ? (
                          format(exportOptions.dateRange.to, "PPP")
                        ) : (
                          "End date"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={exportOptions.dateRange.to || undefined}
                        onSelect={(date) => 
                          setExportOptions(prev => ({
                            ...prev,
                            dateRange: { ...prev.dateRange, to: date || null }
                          }))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Include Options */}
              <div>
                <label className="text-sm font-medium mb-3 block">Include in Export</label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="metadata"
                      checked={exportOptions.includeMetadata}
                      onCheckedChange={(checked) => 
                        setExportOptions(prev => ({ ...prev, includeMetadata: !!checked }))
                      }
                    />
                    <label htmlFor="metadata" className="text-sm">
                      Metadata (tone, response time)
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="confidence"
                      checked={exportOptions.includeConfidence}
                      onCheckedChange={(checked) => 
                        setExportOptions(prev => ({ ...prev, includeConfidence: !!checked }))
                      }
                    />
                    <label htmlFor="confidence" className="text-sm">
                      Confidence scores
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="timestamps"
                      checked={exportOptions.includeTimestamps}
                      onCheckedChange={(checked) => 
                        setExportOptions(prev => ({ ...prev, includeTimestamps: !!checked }))
                      }
                    />
                    <label htmlFor="timestamps" className="text-sm">
                      Timestamps
                    </label>
                  </div>
                </div>
              </div>

              {/* Export Button */}
              <Button 
                onClick={handleExport}
                disabled={exportMutation.isPending || exportOptions.selectedConversations.length === 0}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                {exportMutation.isPending ? 'Exporting...' : `Export ${exportOptions.selectedConversations.length} Conversations`}
              </Button>

              {/* Export Summary */}
              <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <div className="flex justify-between">
                  <span>Selected:</span>
                  <span>{exportOptions.selectedConversations.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Format:</span>
                  <span className="uppercase">{exportOptions.format}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date Range:</span>
                  <span>
                    {exportOptions.dateRange.from && exportOptions.dateRange.to 
                      ? 'Custom'
                      : 'All time'
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversations List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Select Conversations
                  </CardTitle>
                  <CardDescription>
                    Choose which conversations to include in your export
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                  />
                  <label htmlFor="select-all" className="text-sm font-medium">
                    Select All ({filteredConversations.length})
                  </label>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-start space-x-3 p-4 border rounded-lg animate-pulse">
                      <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No conversations found</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    No conversations match your current date range filter
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredConversations.map((conversation: Conversation) => (
                    <div
                      key={conversation.id}
                      className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                        exportOptions.selectedConversations.includes(conversation.id)
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleSelectConversation(conversation.id)}
                    >
                      <Checkbox
                        checked={exportOptions.selectedConversations.includes(conversation.id)}
                        onChange={() => handleSelectConversation(conversation.id)}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium truncate">
                            {conversation.customerMessage.length > 50 
                              ? conversation.customerMessage.substring(0, 50) + '...'
                              : conversation.customerMessage
                            }
                          </h4>
                          <div className="flex items-center gap-2 ml-2">
                            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                              {conversation.tone}
                            </span>
                            <span className="text-xs text-gray-500">
                              {Math.round(conversation.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                          {conversation.aiResponse}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {conversation.responseTime}ms
                            </span>
                            <span>
                              {new Date(conversation.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Export Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Export Templates</CardTitle>
          <CardDescription>
            Common export configurations for different use cases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                setExportOptions(prev => ({
                  ...prev,
                  format: 'pdf',
                  includeMetadata: true,
                  includeConfidence: true,
                  includeTimestamps: true
                }));
              }}
              className="p-4 border rounded-lg text-left hover:border-emerald-500 transition-colors"
            >
              <h4 className="font-medium mb-2">Client Report</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                PDF with full metadata for client presentations
              </p>
            </button>

            <button
              onClick={() => {
                setExportOptions(prev => ({
                  ...prev,
                  format: 'csv',
                  includeMetadata: true,
                  includeConfidence: false,
                  includeTimestamps: true
                }));
              }}
              className="p-4 border rounded-lg text-left hover:border-emerald-500 transition-colors"
            >
              <h4 className="font-medium mb-2">Data Analysis</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                CSV format for spreadsheet analysis
              </p>
            </button>

            <button
              onClick={() => {
                setExportOptions(prev => ({
                  ...prev,
                  format: 'txt',
                  includeMetadata: false,
                  includeConfidence: false,
                  includeTimestamps: false
                }));
              }}
              className="p-4 border rounded-lg text-left hover:border-emerald-500 transition-colors"
            >
              <h4 className="font-medium mb-2">Simple Backup</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Plain text backup without metadata
              </p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}