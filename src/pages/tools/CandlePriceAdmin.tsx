import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { DollarSign, TrendingUp, TrendingDown, RefreshCw, AlertCircle, CheckCircle, Clock, Edit, History, Settings } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PriceResult {
  usdRate: number;
  source: 'coinmarketcap' | 'cached' | 'fallback' | 'manual';
  status: 'live' | 'estimated' | 'fallback';
  timestamp: string;
  marketCap?: number;
  volume24h?: number;
  percentChange24h?: number;
}

interface PriceHistory {
  id: number;
  usdRate: string;
  source: string;
  fetchedAt: string;
  validFrom: string;
  validTo: string | null;
  marketCap: string | null;
  volume24h: string | null;
  percentChange24h: string | null;
  isManualEntry: boolean;
  enteredBy: string | null;
  notes: string | null;
}

interface ApiStatus {
  configured: boolean;
  symbol: string;
}

export default function CandlePriceAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newRate, setNewRate] = useState("");
  const [notes, setNotes] = useState("");
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);

  const { data: currentPrice, isLoading: priceLoading, refetch: refetchPrice } = useQuery<{ success: boolean; data: PriceResult }>({
    queryKey: ['/api/candle-price/current'],
  });

  const { data: apiStatus, isLoading: statusLoading } = useQuery<{ success: boolean; data: ApiStatus }>({
    queryKey: ['/api/candle-price/status'],
  });

  const { data: priceHistory, isLoading: historyLoading } = useQuery<{ success: boolean; data: PriceHistory[] }>({
    queryKey: ['/api/candle-price/history'],
  });

  const setManualPriceMutation = useMutation({
    mutationFn: async (data: { usdRate: number; notes?: string }) => {
      return apiRequest('/api/candle-price/manual', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Price Updated",
        description: "The manual CNDL price has been set successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/candle-price/current'] });
      queryClient.invalidateQueries({ queryKey: ['/api/candle-price/history'] });
      setNewRate("");
      setNotes("");
      setIsManualDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to set manual price",
        variant: "destructive",
      });
    },
  });

  const backfillMutation = useMutation<{ data: { processed: number; errors: number } }>({
    mutationFn: async () => {
      return apiRequest('/api/candle-price/backfill', {
        method: 'POST',
      });
    },
    onSuccess: (data: { data: { processed: number; errors: number } }) => {
      toast({
        title: "Backfill Complete",
        description: `Processed ${data.data.processed} transactions with ${data.data.errors} errors`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to backfill prices",
        variant: "destructive",
      });
    },
  });

  const handleSetManualPrice = () => {
    const rate = parseFloat(newRate);
    if (isNaN(rate) || rate <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid positive number",
        variant: "destructive",
      });
      return;
    }
    const payload = notes ? { usdRate: rate, notes } : { usdRate: rate };
    setManualPriceMutation.mutate(payload);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 6,
    }).format(amount);
  };

  const formatLargeCurrency = (amount: number) => {
    if (amount >= 1_000_000_000) {
      return `$${(amount / 1_000_000_000).toFixed(2)}B`;
    } else if (amount >= 1_000_000) {
      return `$${(amount / 1_000_000).toFixed(2)}M`;
    } else if (amount >= 1_000) {
      return `$${(amount / 1_000).toFixed(2)}K`;
    }
    return formatCurrency(amount);
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'coinmarketcap':
        return <Badge className="bg-green-500" data-testid="badge-source-live">Live API</Badge>;
      case 'cached':
        return <Badge className="bg-purple-500" data-testid="badge-source-cached">Cached</Badge>;
      case 'manual':
        return <Badge className="bg-purple-500" data-testid="badge-source-manual">Manual</Badge>;
      case 'fallback':
        return <Badge className="bg-yellow-500" data-testid="badge-source-fallback">Fallback</Badge>;
      default:
        return <Badge variant="secondary" data-testid="badge-source-unknown">{source}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'live':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'estimated':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'fallback':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default:
        return null;
    }
  };

  const price = currentPrice?.data;
  const status = apiStatus?.data;
  const history = priceHistory?.data || [];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Candle Token Price Management</h1>
        <p className="text-muted-foreground mt-2">Manage CNDL/USD pricing for tax reporting and donation valuations</p>
      </div>

      <Tabs defaultValue="current" className="space-y-6">
        <TabsList>
          <TabsTrigger value="current" className="flex items-center gap-2" data-testid="tab-current-price">
            <DollarSign className="h-4 w-4" />
            Current Price
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2" data-testid="tab-price-history">
            <History className="h-4 w-4" />
            Price History
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2" data-testid="tab-settings">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card data-testid="card-current-price">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current CNDL Price</CardTitle>
                <div className="flex items-center gap-2">
                  {price && getStatusIcon(price.status)}
                  <Button variant="ghost" size="sm" onClick={() => refetchPrice()} data-testid="button-refresh-price">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {priceLoading ? (
                  <div className="animate-pulse h-8 bg-muted rounded" />
                ) : price ? (
                  <>
                    <div className="text-3xl font-bold" data-testid="text-current-rate">
                      {formatCurrency(price.usdRate)}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {getSourceBadge(price.source)}
                      <span className="text-xs text-muted-foreground">
                        Updated {format(new Date(price.timestamp), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-muted-foreground">No price data available</div>
                )}
              </CardContent>
            </Card>

            {price && price.percentChange24h !== undefined && (
              <Card data-testid="card-24h-change">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">24h Change</CardTitle>
                  {price.percentChange24h >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${price.percentChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {price.percentChange24h >= 0 ? '+' : ''}{price.percentChange24h.toFixed(2)}%
                  </div>
                </CardContent>
              </Card>
            )}

            {price && price.marketCap && (
              <Card data-testid="card-market-cap">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Market Cap</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatLargeCurrency(price.marketCap)}
                  </div>
                  {price.volume24h && (
                    <p className="text-xs text-muted-foreground mt-2">
                      24h Volume: {formatLargeCurrency(price.volume24h)}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {price?.status === 'fallback' && (
            <Alert variant="destructive" data-testid="alert-fallback-mode">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Fallback Mode Active</AlertTitle>
              <AlertDescription>
                Unable to fetch live price from CoinMarketCap. Using the fallback rate of $0.01 per CNDL.
                You can set a manual price below for accurate tax reporting.
              </AlertDescription>
            </Alert>
          )}

          <Card data-testid="card-set-manual-price">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Set Manual Price
              </CardTitle>
              <CardDescription>
                Override the current CNDL price with a manual entry. This is useful when the token is not listed on public exchanges.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="newRate">New USD Rate</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="newRate"
                      type="number"
                      step="0.0001"
                      placeholder="0.01"
                      value={newRate}
                      onChange={(e) => setNewRate(e.target.value)}
                      className="pl-9"
                      data-testid="input-new-rate"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    placeholder="Reason for price change..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    data-testid="input-notes"
                  />
                </div>
              </div>
              <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
                <DialogTrigger asChild>
                  <Button disabled={!newRate} data-testid="button-set-price">
                    Set Manual Price
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Price Update</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to set the CNDL price to {newRate ? formatCurrency(parseFloat(newRate)) : '$0.00'}?
                      This will affect all future donation valuations until a new price is set.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsManualDialogOpen(false)} data-testid="button-cancel-set-price">
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSetManualPrice}
                      disabled={setManualPriceMutation.isPending}
                      data-testid="button-confirm-set-price"
                    >
                      {setManualPriceMutation.isPending ? "Setting..." : "Confirm"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card data-testid="card-price-history">
            <CardHeader>
              <CardTitle>Price History</CardTitle>
              <CardDescription>
                Historical CNDL/USD rates used for donation valuations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="animate-pulse space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-muted rounded" />
                  ))}
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No price history available
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>USD Rate</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Valid Period</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((entry) => (
                      <TableRow key={entry.id} data-testid={`row-price-history-${entry.id}`}>
                        <TableCell>
                          {format(new Date(entry.fetchedAt), 'MMM d, yyyy h:mm a')}
                        </TableCell>
                        <TableCell className="font-mono font-medium">
                          {formatCurrency(parseFloat(entry.usdRate))}
                        </TableCell>
                        <TableCell>
                          {getSourceBadge(entry.source)}
                          {entry.isManualEntry && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              by {entry.enteredBy}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(entry.validFrom), 'MMM d')} -
                          {entry.validTo ? format(new Date(entry.validTo), ' MMM d') : ' Present'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {entry.notes || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card data-testid="card-api-status">
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>
                CoinMarketCap API status and configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {statusLoading ? (
                <div className="animate-pulse h-16 bg-muted rounded" />
              ) : status ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    {status.configured ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-yellow-500" />
                    )}
                    <div>
                      <div className="font-medium">API Status</div>
                      <div className="text-sm text-muted-foreground">
                        {status.configured ? 'CoinMarketCap API configured' : 'Using fallback pricing'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <DollarSign className="h-6 w-6 text-primary" />
                    <div>
                      <div className="font-medium">Token Symbol</div>
                      <div className="text-sm text-muted-foreground">{status.symbol}</div>
                    </div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card data-testid="card-backfill">
            <CardHeader>
              <CardTitle>Backfill Missing Prices</CardTitle>
              <CardDescription>
                Apply pricing to historical transactions that don't have USD valuations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => backfillMutation.mutate()}
                disabled={backfillMutation.isPending}
                data-testid="button-backfill"
              >
                {backfillMutation.isPending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Backfill Missing Prices'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
