import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
// Note: ContentModeration component needs to be migrated
// import ContentModeration from "./ContentModeration";
import { Loader2, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function GroupModeration() {
  const params = useParams();
  const groupId = params.id;

  // Fetch group details
  const { data: group, isLoading } = useQuery<{ id: string; name: string }>({
    queryKey: ['/api/communities', groupId],
    enabled: !!groupId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  // TODO: Replace with actual ContentModeration component when migrated
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Group Content Moderation
          </CardTitle>
          <CardDescription>
            {group?.name ? `Moderating content for ${group.name}` : 'Group Moderation'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400">
            ContentModeration component needs to be migrated from SoapBox-Super-App.
          </p>
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-sm">
              <strong>Scope:</strong> group<br />
              {groupId && <><strong>Community ID:</strong> {groupId}<br /></>}
              {group?.name && <><strong>Community Name:</strong> {group.name}</>}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
