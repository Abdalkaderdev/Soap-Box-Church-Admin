// Note: These components need to be migrated:
// import { ProfessionalVideoStudio } from '../../components/ProfessionalVideoStudio';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Crown, Lock, Sparkles, Check, Video, Zap } from 'lucide-react';

function ProfessionalStudio() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();

  // Check if user is a church admin (church admins get automatic Pro access)
  const { data: churchAdminStatus, isLoading: churchLoading } = useQuery<{ isChurchAdmin: boolean; hasChurchSubscription: boolean; hasProAccess: boolean }>({
    queryKey: ['/api/user/church-admin-status'],
    enabled: !!user,
  });

  const handleClose = () => {
    setLocation('/dashboard');
  };

  const handleUpgrade = () => {
    setLocation('/settings?tab=subscription');
  };

  // Loading state
  if (authLoading || churchLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Check access: Torchbearer plan for individuals OR church admin (automatic Pro access)
  const hasIndividualAccess = (user as any)?.subscriptionTier === 'torchbearer';
  const hasChurchAdminAccess = churchAdminStatus?.hasProAccess || false;
  const hasAccess = hasIndividualAccess || hasChurchAdminAccess;

  // If user doesn't have access, show upgrade screen
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full bg-gray-900 border-purple-500/20">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-600 rounded-full flex items-center justify-center">
              <Lock className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-white">
              Professional Studio
              <Crown className="inline-block ml-2 h-6 w-6 text-yellow-400" />
            </CardTitle>
            <CardDescription className="text-gray-400 text-lg">
              Unlock professional-grade video editing capabilities
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Features List */}
            <div className="space-y-3">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                Professional Features Included:
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>AI-powered video transcription and auto-captions in 100+ languages</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Professional filters and cinematic color grading</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Advanced timeline editing with transitions and effects</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Multi-platform content optimization (YouTube, TikTok, Instagram)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>AI highlights detection and smart cropping</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Export up to 8K resolution with professional audio mixing</span>
                </li>
              </ul>
            </div>

            {/* Access Requirements */}
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Video className="h-5 w-5 text-purple-400" />
                Access Requirements:
              </h4>
              <div className="text-gray-300 space-y-2 text-sm">
                <p className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Individuals:</strong> Torchbearer subscription required</span>
                </p>
                <p className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Church Admins:</strong> Automatic access included</span>
                </p>
              </div>
            </div>

            {/* Current Status */}
            <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
              <p className="text-gray-400 text-sm">
                <strong>Your current plan:</strong> <span className="text-white capitalize">{(user as any)?.subscriptionTier || 'disciple'}</span>
              </p>
              <p className="text-gray-400 text-sm">
                To unlock Professional Studio, upgrade to Torchbearer or become a Church Admin.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleUpgrade}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-600 hover:from-purple-700 hover:to-purple-700 text-white font-semibold h-12"
                data-testid="button-upgrade-professional-studio"
              >
                <Crown className="h-5 w-5 mr-2" />
                Upgrade to Unlock
              </Button>
              <Button
                onClick={handleClose}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
                data-testid="button-back"
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User has access - show the full Professional Studio
  // TODO: Migrate ProfessionalVideoStudio component
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto p-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Video className="h-6 w-6" />
              Professional Video Studio
              <Crown className="h-5 w-5 text-yellow-400" />
            </CardTitle>
            <CardDescription className="text-gray-400">
              ProfessionalVideoStudio component needs to be migrated from SoapBox-Super-App
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Video className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">
                The full professional video editing interface will be available once the ProfessionalVideoStudio component is migrated.
              </p>
              <Button onClick={handleClose} className="mt-4" variant="outline">
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ProfessionalStudio;
