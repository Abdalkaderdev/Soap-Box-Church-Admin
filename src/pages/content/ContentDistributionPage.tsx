import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Note: These components need to be migrated:
// import ContentDistributionHub from "../../components/ContentDistributionHub";
// import VideoDistributionHub from "../../components/VideoDistributionHub";
import { FileText, Video } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContentDistributionPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Content Distribution Center
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Distribute your sermons, lessons, and videos across multiple platforms with AI-powered optimization
          </p>
        </div>

        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="content" className="flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Text Content Distribution
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center">
              <Video className="w-4 h-4 mr-2" />
              Video Distribution
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content">
            {/* TODO: Migrate ContentDistributionHub component */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Text Content Distribution Hub
                </CardTitle>
                <CardDescription>
                  Distribute sermons, articles, and written content across platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Content Distribution Hub component needs to be migrated from SoapBox-Super-App.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="video">
            {/* TODO: Migrate VideoDistributionHub component */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Video Distribution Hub
                </CardTitle>
                <CardDescription>
                  Distribute video content across YouTube, social media, and more
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Video Distribution Hub component needs to be migrated from SoapBox-Super-App.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
