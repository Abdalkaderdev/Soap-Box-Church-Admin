import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Download,
  Mail,
  Send,
  Calendar,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  Settings,
  Loader2,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface StatementBatch {
  id: number;
  batchId: string;
  statementYear: number;
  scope: string;
  totalStatements: number;
  emailsSent: number;
  totalFiatAmount: string;
  status: string;
  generatedAt: string;
  completedAt?: string;
}

interface Statement {
  id: number;
  donorId?: string;
  donorName?: string;
  donorEmail?: string;
  donorAddress?: string;
  statementYear: number;
  statementNumber: string;
  fiatTotal: string;
  donationCount: number;
  emailSent: boolean;
  emailSentAt?: string;
}

interface ChurchTaxSettings {
  id: number;
  legalName?: string;
  ein?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  statementHeaderText?: string;
  statementFooterText?: string;
  signerName?: string;
  signerTitle?: string;
}

export default function GivingStatements() {
  const { churchId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<StatementBatch | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear() - 1));

  // Form states
  const [generateForm, setGenerateForm] = useState({
    year: new Date().getFullYear() - 1,
    includeItemizedList: true,
  });

  const [settingsForm, setSettingsForm] = useState<Partial<ChurchTaxSettings>>({});

  // Fetch statement batches
  const { data: batchesData, isLoading: loadingBatches } = useQuery({
    queryKey: ["statement-batches", churchId, selectedYear],
    queryFn: () =>
      api.get<{ data: StatementBatch[] }>(
        `/church/${churchId}/statements${selectedYear !== "all" ? `?year=${selectedYear}` : ""}`
      ),
    enabled: !!churchId,
  });

  // Fetch statements in selected batch
  const { data: statementsData, isLoading: loadingStatements } = useQuery({
    queryKey: ["batch-statements", selectedBatch?.batchId],
    queryFn: () =>
      api.get<{ data: Statement[] }>(
        `/church/${churchId}/statements/batch/${selectedBatch?.batchId}`
      ),
    enabled: !!selectedBatch,
  });

  // Fetch settings
  const { data: settingsData, isLoading: loadingSettings } = useQuery({
    queryKey: ["statement-settings", churchId],
    queryFn: () => api.get<{ data: ChurchTaxSettings | null }>(`/church/${churchId}/statements/settings`),
    enabled: !!churchId && isSettingsOpen,
  });

  // Generate statements mutation
  const generateStatements = useMutation({
    mutationFn: (data: typeof generateForm) =>
      api.post(`/church/${churchId}/statements/generate`, data),
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ["statement-batches"] });
      setIsGenerateOpen(false);
      toast({
        title: "Statements generated",
        description: `Generated ${result.data?.statementsGenerated || 0} statements for ${generateForm.year}.`,
      });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to generate statements.", variant: "destructive" });
    },
  });

  // Send statement email mutation
  const sendStatement = useMutation({
    mutationFn: (statementId: number) =>
      api.post(`/church/${churchId}/statements/${statementId}/send`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batch-statements"] });
      toast({ title: "Statement sent", description: "Email has been sent to the donor." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send statement.", variant: "destructive" });
    },
  });

  // Update settings mutation
  const updateSettings = useMutation({
    mutationFn: (data: Partial<ChurchTaxSettings>) =>
      api.put(`/church/${churchId}/statements/settings`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["statement-settings"] });
      setIsSettingsOpen(false);
      toast({ title: "Settings saved", description: "Statement settings have been updated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
    },
  });

  const batches = batchesData?.data || [];
  const statements = statementsData?.data || [];

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num || 0);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Calculate totals for selected batch
  const batchTotals = statements.reduce(
    (acc, s) => ({
      totalAmount: acc.totalAmount + parseFloat(s.fiatTotal || "0"),
      totalDonations: acc.totalDonations + (s.donationCount || 0),
      emailsSent: acc.emailsSent + (s.emailSent ? 1 : 0),
    }),
    { totalAmount: 0, totalDonations: 0, emailsSent: 0 }
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Giving Statements</h1>
          <p className="text-muted-foreground mt-1">
            Generate and send annual giving statements for tax purposes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setIsSettingsOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Generate Statements
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Giving Statements</DialogTitle>
                <DialogDescription>
                  Create annual giving statements for all donors.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Tax Year</Label>
                  <Select
                    value={String(generateForm.year)}
                    onValueChange={(v) => setGenerateForm({ ...generateForm, year: parseInt(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={String(year)}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="itemized"
                    checked={generateForm.includeItemizedList}
                    onCheckedChange={(checked) =>
                      setGenerateForm({ ...generateForm, includeItemizedList: checked as boolean })
                    }
                  />
                  <Label htmlFor="itemized">Include itemized donation list</Label>
                </div>
                <div className="bg-muted p-4 rounded-lg text-sm">
                  <p className="font-medium mb-2">What happens when you generate:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Statements are created for all donors with donations in {generateForm.year}</li>
                    <li>Each statement includes total giving and tax-deductible amounts</li>
                    <li>Itemized lists show individual donations by date</li>
                    <li>Statements can be emailed or downloaded as PDF</li>
                  </ul>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsGenerateOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => generateStatements.mutate(generateForm)}
                  disabled={generateStatements.isPending}
                >
                  {generateStatements.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Generate Statements
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs for Batches vs Individual Statements */}
      <Tabs defaultValue="batches" className="space-y-6">
        <TabsList>
          <TabsTrigger value="batches">Statement Batches</TabsTrigger>
          <TabsTrigger value="statements" disabled={!selectedBatch}>
            Individual Statements {selectedBatch && `(${selectedBatch.statementYear})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="batches" className="space-y-6">
          {/* Filter */}
          <div className="flex items-center gap-4">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Batches List */}
          <Card>
            <CardHeader>
              <CardTitle>Statement Batches</CardTitle>
              <CardDescription>Generated statement batches by year</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingBatches ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : batches.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No statement batches generated yet</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setIsGenerateOpen(true)}
                  >
                    Generate First Batch
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Year</TableHead>
                      <TableHead>Generated</TableHead>
                      <TableHead className="text-center">Statements</TableHead>
                      <TableHead className="text-center">Emails Sent</TableHead>
                      <TableHead className="text-right">Total Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batches.map((batch) => (
                      <TableRow key={batch.id}>
                        <TableCell className="font-semibold">{batch.statementYear}</TableCell>
                        <TableCell>{formatDate(batch.generatedAt)}</TableCell>
                        <TableCell className="text-center">{batch.totalStatements}</TableCell>
                        <TableCell className="text-center">
                          {batch.emailsSent} / {batch.totalStatements}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(batch.totalFiatAmount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={batch.status === "completed" ? "default" : "secondary"}
                          >
                            {batch.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedBatch(batch)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statements" className="space-y-6">
          {selectedBatch && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Statements
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statements.length}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Giving
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(batchTotals.totalAmount)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Donations
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{batchTotals.totalDonations}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Emails Sent
                    </CardTitle>
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {batchTotals.emailsSent} / {statements.length}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Statements Table */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedBatch.statementYear} Statements</CardTitle>
                      <CardDescription>
                        Generated on {formatDate(selectedBatch.generatedAt)}
                      </CardDescription>
                    </div>
                    <Button variant="outline" onClick={() => setSelectedBatch(null)}>
                      Back to Batches
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingStatements ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Statement #</TableHead>
                          <TableHead>Donor</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead className="text-center">Donations</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead>Email Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {statements.map((statement) => (
                          <TableRow key={statement.id}>
                            <TableCell className="font-mono text-sm">
                              {statement.statementNumber}
                            </TableCell>
                            <TableCell className="font-medium">
                              {statement.donorName || "Unknown"}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {statement.donorEmail || "-"}
                            </TableCell>
                            <TableCell className="text-center">{statement.donationCount}</TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(statement.fiatTotal)}
                            </TableCell>
                            <TableCell>
                              {statement.emailSent ? (
                                <Badge variant="default" className="gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Sent
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="gap-1">
                                  <Clock className="h-3 w-3" />
                                  Pending
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download PDF
                                  </DropdownMenuItem>
                                  {statement.donorEmail && !statement.emailSent && (
                                    <DropdownMenuItem
                                      onClick={() => sendStatement.mutate(statement.id)}
                                    >
                                      <Send className="h-4 w-4 mr-2" />
                                      Send Email
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Preview
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Statement Settings</DialogTitle>
            <DialogDescription>
              Configure your church's information for giving statements.
            </DialogDescription>
          </DialogHeader>
          {loadingSettings ? (
            <div className="space-y-4 py-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Legal Name</Label>
                  <Input
                    placeholder="First Baptist Church of Springfield"
                    defaultValue={settingsData?.data?.legalName}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, legalName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>EIN (Tax ID)</Label>
                  <Input
                    placeholder="XX-XXXXXXX"
                    defaultValue={settingsData?.data?.ein}
                    onChange={(e) => setSettingsForm({ ...settingsForm, ein: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  placeholder="123 Church Street"
                  defaultValue={settingsData?.data?.address}
                  onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    defaultValue={settingsData?.data?.city}
                    onChange={(e) => setSettingsForm({ ...settingsForm, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input
                    defaultValue={settingsData?.data?.state}
                    onChange={(e) => setSettingsForm({ ...settingsForm, state: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>ZIP Code</Label>
                  <Input
                    defaultValue={settingsData?.data?.zipCode}
                    onChange={(e) => setSettingsForm({ ...settingsForm, zipCode: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Signer Name</Label>
                  <Input
                    placeholder="Pastor John Smith"
                    defaultValue={settingsData?.data?.signerName}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, signerName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Signer Title</Label>
                  <Input
                    placeholder="Senior Pastor"
                    defaultValue={settingsData?.data?.signerTitle}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, signerTitle: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => updateSettings.mutate(settingsForm)}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
