import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FeatureGate } from "@/components/FeatureGate";
import { 
  Download, 
  FileText, 
  FileSpreadsheet,
  File,
  FileImage,
  Calendar,
  Filter,
  Settings,
  History,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Trash2,
  RefreshCw,
  Upload,
  CloudUpload
} from "lucide-react";

interface ExportRecord {
  id: number;
  exportType: string;
  fileName: string;
  fileSize: number;
  recordCount: number;
  dateRange?: any;
  filters?: any;
  status: string;
  createdAt: string;
  expiresAt?: string;
}

interface ExportFilters {
  dateRange: {
    from?: string;
    to?: string;
  };
  tone: string;
  minConfidence: number;
  limit: number;
}

const EXPORT_TYPES = [
  { 
    value: 'pdf', 
    label: 'PDF Document', 
    icon: FileImage, 
    description: 'Professional formatted document with conversations' 
  },
  { 
    value: 'csv', 
    label: 'CSV Spreadsheet', 
    icon: FileSpreadsheet, 
    description: 'Comma-separated values for data analysis' 
  },
  { 
    value: 'txt', 
    label: 'Text File', 
    icon: FileText, 
    description: 'Plain text format with formatted conversations' 
  },
  { 
    value: 'json', 
    label: 'JSON Data', 
    icon: File, 
    description: 'Structured data format for developers' 
  }
];

const TONE_OPTIONS = [
  { value: 'all', label: 'All Tones' },
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'casual', label: 'Casual' },
  { value: 'formal', label: 'Formal' }
];

export default function Export() {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportType, setExportType] = useState('pdf');
  const [fileName, setFileName] = useState('');
  const [activeTab, setActiveTab] = useState("export");
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [filters, setFilters] = useState<ExportFilters>({
    dateRange: {},
    tone: 'all',
    minConfidence: 0,
    limit: 1000
  });

  const { data: exportHistory = [], isLoading: loadingHistory } = useQuery({
    queryKey: ['/api/export/history'],
    queryFn: async () => {
      const response = await fetch('/api/export/history');
      if (!response.ok) {
        throw new Error('Failed to fetch export history');
      }
      return response.json();
    }
  });

  const exportMutation = useMutation({
    mutationFn: async (exportData: any) => {
      setIsExporting(true);
      setExportProgress(10);
      
      const response = await fetch('/api/export/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportData),
      });

      setExportProgress(50);

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // For PDF exports, we get JSON data back for frontend processing
      if (exportData.exportType === 'pdf') {
        const result = await response.json();
        setExportProgress(75);
        await generatePDF(result.data, result.fileName);
        setExportProgress(100);
        return result;
      } else {
        // For other formats, we get a file directly
        const blob = await response.blob();
        setExportProgress(75);
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = exportData.fileName || `conversations.${exportData.exportType}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setExportProgress(100);
        return { success: true };
      }
    },
    onSuccess: () => {
      toast({
        title: "Export Completed",
        description: "Your conversations have been exported successfully.",
      });
      setIsExportDialogOpen(false);
      setIsExporting(false);
      setExportProgress(0);
      setFileName('');
      queryClient.invalidateQueries({ queryKey: ['/api/export/history'] });
    },
    onError: (error: any) => {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export conversations",
        variant: "destructive",
      });
      setIsExporting(false);
      setExportProgress(0);
    }
  });

  const generatePDF = async (conversations: any[], fileName: string) => {
    // Simple PDF generation using the browser's print functionality
    // In a production app, you might want to use a library like jsPDF or react-pdf
    try {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        let htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Savrii Conversation Export</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 20px; 
                line-height: 1.6; 
                color: #333;
              }
              .header { 
                text-align: center; 
                border-bottom: 2px solid #10B981; 
                padding-bottom: 20px; 
                margin-bottom: 30px; 
              }
              .conversation { 
                margin-bottom: 30px; 
                border: 1px solid #e2e8f0; 
                border-radius: 8px; 
                padding: 20px; 
                background: #f8fafc;
              }
              .conversation-header { 
                background: #10B981; 
                color: white; 
                padding: 10px 15px; 
                margin: -20px -20px 15px -20px; 
                border-radius: 7px 7px 0 0; 
                font-weight: bold;
              }
              .message { 
                margin: 15px 0; 
                padding: 10px; 
                border-radius: 5px; 
              }
              .client-message { 
                background: #e0f2fe; 
                border-left: 4px solid #0284c7; 
              }
              .ai-response { 
                background: #f0f9ff; 
                border-left: 4px solid #10b981; 
              }
              .metadata { 
                font-size: 0.9em; 
                color: #666; 
                margin-top: 10px; 
              }
              @media print {
                body { margin: 0; }
                .conversation { break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Savrii Conversation Export</h1>
              <p>Generated: ${new Date().toLocaleDateString()}</p>
              <p>Total Conversations: ${conversations.length}</p>
            </div>
        `;

        conversations.forEach((conv, index) => {
          htmlContent += `
            <div class="conversation">
              <div class="conversation-header">
                Conversation #${index + 1} - ${conv.createdAt ? new Date(conv.createdAt).toLocaleDateString() : 'N/A'}
              </div>
              <div class="message client-message">
                <strong>Client Message:</strong><br>
                ${conv.clientMessage || 'N/A'}
              </div>
              <div class="message ai-response">
                <strong>AI Response:</strong><br>
                ${conv.response || 'N/A'}
              </div>
              <div class="metadata">
                <strong>Tone:</strong> ${conv.tone || 'N/A'} | 
                <strong>Confidence:</strong> ${conv.confidenceScore || 0}/100 | 
                <strong>Generation Time:</strong> ${conv.generationTime || 0}ms
                ${conv.userFeedback ? ` | <strong>Feedback:</strong> ${conv.userFeedback}` : ''}
              </div>
            </div>
          `;
        });

        htmlContent += `
          </body>
          </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Trigger print dialog
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 1000);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  };

  const handleExport = () => {
    if (!fileName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a file name",
        variant: "destructive",
      });
      return;
    }

    const exportData = {
      exportType,
      fileName: fileName.includes('.') ? fileName : `${fileName}.${exportType}`,
      filters: {
        ...filters,
        dateRange: Object.keys(filters.dateRange).length > 0 ? filters.dateRange : undefined
      }
    };

    exportMutation.mutate(exportData);
  };

  const getExportTypeIcon = (type: string) => {
    const typeData = EXPORT_TYPES.find(t => t.value === type);
    return typeData ? typeData.icon : File;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      processing: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    };
    return variants[status as keyof typeof variants] || variants.completed;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'processing': return Clock;
      case 'failed': return XCircle;
      default: return CheckCircle;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isExportExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  // File upload handlers
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const validTypes = ['application/json', 'text/csv', 'text/plain', 'application/pdf'];
    
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please select a JSON, CSV, TXT, or PDF file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    toast({
      title: "File Selected",
      description: `${file.name} (${formatFileSize(file.size)}) ready for import.`,
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  }, [handleFileSelect]);

  const handleImportFile = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const response = await fetch('/api/import/conversations', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Import failed');
      }

      const result = await response.json();
      
      toast({
        title: "Import Successful",
        description: `Imported ${result.recordCount} conversations successfully.`,
      });

      setUploadedFile(null);
      queryClient.invalidateQueries({ queryKey: ['/api/export/history'] });
    } catch (error: any) {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import conversations",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <FeatureGate 
      feature="export_data" 
      fallback={
        <div className="text-center py-12">
          <Download className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Export Conversations</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
            Download your conversation transcripts in PDF, CSV, or TXT formats. Upgrade to Pro to unlock export features.
          </p>
          <Button onClick={() => window.location.href = '/billing'}>
            Upgrade to Pro
          </Button>
        </div>
      }
    >
      <div className="container mx-auto p-6 pt-20 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white flex items-center gap-2">
              <Download className="w-8 h-8 text-emerald-600" />
              Export Conversations
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Download your chat transcripts in PDF, CSV, TXT, or JSON formats
            </p>
          </div>
          
          <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Download className="w-4 h-4 mr-2" />
                New Export
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Export Conversations</DialogTitle>
                <DialogDescription>
                  Choose your export format and configure filters to download your conversation data.
                </DialogDescription>
              </DialogHeader>
              
              {isExporting && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Exporting conversations...</span>
                  </div>
                  <Progress value={exportProgress} className="w-full" />
                </div>
              )}

              {!isExporting && (
                <div className="space-y-4">
                  {/* Export Type Selection */}
                  <div>
                    <Label className="text-sm mb-2 block">Export Format</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {EXPORT_TYPES.map((type) => {
                        const Icon = type.icon;
                        return (
                          <div
                            key={type.value}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              exportType === type.value 
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setExportType(type.value)}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className="w-4 h-4 text-emerald-600" />
                              <span className="font-medium text-sm">{type.label}</span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-300">
                              {type.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* File Name */}
                  <div>
                    <Label htmlFor="fileName">File Name</Label>
                    <Input
                      id="fileName"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      placeholder={`conversations_${new Date().toISOString().split('T')[0]}`}
                    />
                  </div>

                  {/* Filters */}
                  <div className="space-y-3">
                    <Label className="text-sm">Export Filters</Label>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="dateFrom" className="text-xs">From Date</Label>
                        <Input
                          id="dateFrom"
                          type="date"
                          className="text-sm"
                          value={filters.dateRange.from || ''}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            dateRange: { ...prev.dateRange, from: e.target.value }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="dateTo" className="text-xs">To Date</Label>
                        <Input
                          id="dateTo"
                          type="date"
                          className="text-sm"
                          value={filters.dateRange.to || ''}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            dateRange: { ...prev.dateRange, to: e.target.value }
                          }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="tone" className="text-xs">Tone Filter</Label>
                        <Select value={filters.tone} onValueChange={(value) => 
                          setFilters(prev => ({ ...prev, tone: value }))
                        }>
                          <SelectTrigger className="text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TONE_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="minConfidence" className="text-xs">Min Confidence</Label>
                        <Input
                          id="minConfidence"
                          type="number"
                          min="0"
                          max="100"
                          className="text-sm"
                          value={filters.minConfidence}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            minConfidence: parseInt(e.target.value) || 0
                          }))}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="limit" className="text-xs">Maximum Records</Label>
                      <Input
                        id="limit"
                        type="number"
                        min="1"
                        max="10000"
                        className="text-sm"
                        value={filters.limit}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          limit: parseInt(e.target.value) || 1000
                        }))}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Limit: 1-10,000 records
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleExport} disabled={exportMutation.isPending}>
                      {exportMutation.isPending ? "Exporting..." : "Export Conversations"}
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="export">Quick Export</TabsTrigger>
            <TabsTrigger value="import">Import Data</TabsTrigger>
            <TabsTrigger value="history">Export History</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-6">
            {/* Quick Export Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {EXPORT_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <Card key={type.value} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <Icon className="w-6 h-6 text-emerald-600" />
                        <h3 className="font-semibold">{type.label}</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        {type.description}
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          setExportType(type.value);
                          setFileName(`conversations_${new Date().toISOString().split('T')[0]}.${type.value}`);
                          setIsExportDialogOpen(true);
                        }}
                      >
                        <Download className="w-3 h-3 mr-2" />
                        Export as {type.value.toUpperCase()}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Export Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Export Statistics</CardTitle>
                <CardDescription>
                  Overview of your conversation export activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">
                      {exportHistory.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Total Exports
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {exportHistory.reduce((sum: number, exp: any) => sum + (exp.recordCount || 0), 0)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Records Exported
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatFileSize(exportHistory.reduce((sum: number, exp: any) => sum + (exp.fileSize || 0), 0))}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Total Size
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="import" className="space-y-6">
            {/* File Upload Area */}
            <Card>
              <CardHeader>
                <CardTitle>Import Conversations</CardTitle>
                <CardDescription>
                  Upload conversation data from JSON, CSV, TXT, or PDF files
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Drag and Drop Zone */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragOver
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,.csv,.txt,.pdf"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  
                  <CloudUpload className={`w-12 h-12 mx-auto mb-4 ${
                    isDragOver ? 'text-emerald-600' : 'text-gray-400'
                  }`} />
                  
                  <h3 className="text-lg font-semibold mb-2">
                    {isDragOver ? 'Drop your file here' : 'Drag & drop your file here'}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Supports JSON, CSV, TXT, and PDF files up to 10MB
                  </p>
                  
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="mb-2"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Select File from Device
                  </Button>
                  
                  {uploadedFile && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <File className="w-4 h-4 text-emerald-600" />
                          <span className="font-medium">{uploadedFile.name}</span>
                          <span className="text-sm text-gray-500">
                            ({formatFileSize(uploadedFile.size)})
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setUploadedFile(null)}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleImportFile}
                          disabled={isUploading}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          {isUploading ? (
                            <>
                              <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                              Importing...
                            </>
                          ) : (
                            <>
                              <Upload className="w-3 h-3 mr-2" />
                              Import File
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setUploadedFile(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Import Instructions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      Supported Formats
                    </h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      <li>• <strong>JSON:</strong> Structured conversation data</li>
                      <li>• <strong>CSV:</strong> Spreadsheet format with headers</li>
                      <li>• <strong>TXT:</strong> Plain text conversations</li>
                      <li>• <strong>PDF:</strong> Text extraction from documents</li>
                    </ul>
                  </Card>
                  
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-purple-600" />
                      Import Guidelines
                    </h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      <li>• Maximum file size: 10MB</li>
                      <li>• Duplicate conversations will be merged</li>
                      <li>• Import history is automatically tracked</li>
                      <li>• Processing may take a few moments</li>
                    </ul>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {loadingHistory ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : exportHistory.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Export History</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    You haven't exported any conversations yet. Start by creating your first export.
                  </p>
                  <Button onClick={() => setIsExportDialogOpen(true)}>
                    <Download className="w-4 h-4 mr-2" />
                    Create First Export
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {exportHistory.map((exportRecord: ExportRecord) => {
                  const Icon = getExportTypeIcon(exportRecord.exportType);
                  const StatusIcon = getStatusIcon(exportRecord.status);
                  const expired = isExportExpired(exportRecord.expiresAt);
                  
                  return (
                    <Card key={exportRecord.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="w-5 h-5 text-emerald-600" />
                            <div>
                              <CardTitle className="text-base">{exportRecord.fileName}</CardTitle>
                              <CardDescription className="text-sm">
                                {exportRecord.recordCount} records • {formatFileSize(exportRecord.fileSize)}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge className={getStatusBadge(exportRecord.status)}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {exportRecord.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">Created:</span>
                          <span className="font-medium">{formatDate(exportRecord.createdAt)}</span>
                        </div>
                        
                        {exportRecord.expiresAt && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-300">Expires:</span>
                            <span className={`font-medium ${expired ? 'text-red-600' : 'text-gray-900 dark:text-gray-100'}`}>
                              {formatDate(exportRecord.expiresAt)}
                            </span>
                          </div>
                        )}

                        {exportRecord.filters && (
                          <div className="text-xs text-gray-500">
                            {exportRecord.filters.tone && exportRecord.filters.tone !== 'all' && (
                              <span className="inline-block bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded mr-1">
                                {exportRecord.filters.tone}
                              </span>
                            )}
                            {exportRecord.filters.minConfidence > 0 && (
                              <span className="inline-block bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded mr-1">
                                ≥{exportRecord.filters.minConfidence}% confidence
                              </span>
                            )}
                          </div>
                        )}

                        <Separator />
                        
                        <div className="flex gap-2">
                          {!expired && exportRecord.status === 'completed' && (
                            <Button size="sm" variant="outline" className="flex-1">
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline" 
                            disabled={expired}
                            className={expired ? 'opacity-50' : ''}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            {expired ? 'Expired' : 'Download'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </FeatureGate>
  );
}