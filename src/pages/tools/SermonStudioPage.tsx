// Note: These components need to be migrated:
// import SermonCreationStudio from "../../components/SermonCreationStudio";
// import { CommunityScopeProvider } from "../../contexts/CommunityScopeContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Mic, FileText, Sparkles } from "lucide-react";

export default function SermonStudioPage() {
  // TODO: Wrap with CommunityScopeProvider when context is migrated
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Sermon Creation Studio
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Create, edit, and enhance your sermons with AI-powered tools
          </p>
        </div>

        {/* TODO: Migrate SermonCreationStudio component */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Sermon Creation Studio
            </CardTitle>
            <CardDescription>
              SermonCreationStudio component needs to be migrated from SoapBox-Super-App
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <Mic className="h-8 w-8 text-purple-600 mb-2" />
                <h3 className="font-semibold">Record & Transcribe</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Record your sermon and get automatic transcription
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <FileText className="h-8 w-8 text-purple-600 mb-2" />
                <h3 className="font-semibold">Outline & Structure</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Organize your sermon with clear outlines and sections
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <Sparkles className="h-8 w-8 text-purple-600 mb-2" />
                <h3 className="font-semibold">AI Enhancement</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get AI suggestions for illustrations and applications
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
