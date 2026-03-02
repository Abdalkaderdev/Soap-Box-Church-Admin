/**
 * LiveDonationFeed Component
 *
 * Displays real-time donation notifications with toast-style animations.
 *
 * NOTE: This component requires framer-motion for animations.
 * Install it with: npm install framer-motion
 *
 * It also requires a useLiveDonations hook to be implemented for SSE support.
 */

import { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Heart, RefreshCw, Wifi, WifiOff, X, Bell, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Types for live donation data
export interface LiveDonation {
  id: string | number;
  amount: number;
  donorName: string;
  fundName: string;
  communityName: string;
  frequency: 'one_time' | 'weekly' | 'monthly' | 'yearly';
  timestamp: string;
}

interface LiveDonationFeedProps {
  /** Filter by community ID (optional) */
  communityId?: number;
  /** Maximum donations to show in feed */
  maxVisible?: number;
  /** Show compact toast notifications */
  showToasts?: boolean;
  /** Position of toast notifications */
  toastPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  /** Auto-hide toasts after this duration (ms), 0 to disable */
  toastDuration?: number;
  /** Show connection status */
  showConnectionStatus?: boolean;
  /** Additional class name */
  className?: string;
  /** Initial donations to display */
  initialDonations?: LiveDonation[];
  /** Connection status (for demo/testing purposes) */
  isConnected?: boolean;
  /** Error message */
  error?: string | null;
  /** Reconnect callback */
  onReconnect?: () => void;
  /** Callback when new donation arrives */
  onDonation?: (donation: LiveDonation) => void;
}

interface DonationToast {
  id: string;
  donation: LiveDonation;
  visible: boolean;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const frequencyLabels: Record<string, string> = {
  one_time: 'One-time',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

// Toast notification component
const DonationToastComponent = memo(({
  donation,
  onDismiss,
}: {
  donation: LiveDonation;
  onDismiss: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: -20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -20, scale: 0.95 }}
    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    className="pointer-events-auto w-80 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border border-green-200 dark:border-green-800 rounded-lg shadow-lg overflow-hidden"
  >
    <div className="p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-green-800 dark:text-green-200">
              New Donation!
            </p>
            <button
              onClick={onDismiss}
              className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-lg font-bold text-green-700 dark:text-green-300 mt-1">
            {formatCurrency(donation.amount)}
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 truncate">
            {donation.donorName}
            {donation.frequency !== 'one_time' && (
              <span className="ml-1 text-xs">({frequencyLabels[donation.frequency]})</span>
            )}
          </p>
          <p className="text-xs text-green-500 dark:text-green-500 mt-1">
            {donation.fundName} - {donation.communityName}
          </p>
        </div>
      </div>
    </div>
    {/* Animated progress bar */}
    <motion.div
      initial={{ width: '100%' }}
      animate={{ width: '0%' }}
      transition={{ duration: 5, ease: 'linear' }}
      className="h-1 bg-green-400 dark:bg-green-600"
    />
  </motion.div>
));

DonationToastComponent.displayName = 'DonationToast';

// Main feed component
const LiveDonationFeedComponent = ({
  maxVisible = 10,
  showToasts = true,
  toastPosition = 'top-right',
  toastDuration: _toastDuration = 5000,
  showConnectionStatus = true,
  className,
  initialDonations = [],
  isConnected = true,
  error = null,
  onReconnect,
}: LiveDonationFeedProps) => {
  const [toasts, setToasts] = useState<DonationToast[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [donations] = useState<LiveDonation[]>(initialDonations);

  const dismissToast = useCallback((toastId: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === toastId ? { ...t, visible: false } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, 300);
  }, []);

  // Position classes for toasts
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  return (
    <>
      {/* Toast container */}
      {showToasts && (
        <div
          className={cn(
            'fixed z-50 flex flex-col gap-2 pointer-events-none',
            positionClasses[toastPosition]
          )}
        >
          <AnimatePresence mode="popLayout">
            {toasts
              .filter((t) => t.visible)
              .slice(-3) // Only show latest 3 toasts
              .map((toast) => (
                <DonationToastComponent
                  key={toast.id}
                  donation={toast.donation}
                  onDismiss={() => dismissToast(toast.id)}
                />
              ))}
          </AnimatePresence>
        </div>
      )}

      {/* Feed card */}
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-green-600 dark:text-green-400" />
              <CardTitle className="text-lg">Live Donations</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {showConnectionStatus && (
                <Badge
                  variant={isConnected ? 'default' : 'destructive'}
                  className={cn(
                    'text-xs',
                    isConnected
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : ''
                  )}
                >
                  {isConnected ? (
                    <>
                      <Wifi className="h-3 w-3 mr-1" />
                      Live
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-3 w-3 mr-1" />
                      Offline
                    </>
                  )}
                </Badge>
              )}
              {!isConnected && onReconnect && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onReconnect}
                  className="h-7 px-2"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-7 px-2"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          {error && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              {error}
            </p>
          )}
        </CardHeader>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardContent className="pt-2">
                {donations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Heart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No donations yet</p>
                    <p className="text-xs mt-1">New donations will appear here in real-time</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    <AnimatePresence mode="popLayout">
                      {donations.slice(0, maxVisible).map((donation, index) => (
                        <motion.div
                          key={donation.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {donation.donorName}
                              </p>
                              <p className="text-sm font-bold text-green-600 dark:text-green-400">
                                {formatCurrency(donation.amount)}
                              </p>
                            </div>
                            <div className="flex items-center justify-between mt-0.5">
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {donation.fundName}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                {formatTimestamp(donation.timestamp)}
                              </p>
                            </div>
                          </div>
                          {donation.frequency !== 'one_time' && (
                            <Badge variant="outline" className="text-xs flex-shrink-0">
                              {frequencyLabels[donation.frequency]}
                            </Badge>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </>
  );
};

export const LiveDonationFeed = memo(LiveDonationFeedComponent);
export default LiveDonationFeed;
