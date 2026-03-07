import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Video, Upload, Share2, Clock, CheckCircle2, AlertCircle, Globe, Facebook, Twitter, Instagram, Youtube, Linkedin, Copy, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface DistributionChannel {
  id: string;
  name: string;
  icon: React.ElementType;
  enabled: boolean;
  connected: boolean;
}

interface ContentItem {
  id: string;
  title: string;
  type: 'sermon' | 'article' | 'devotional' | 'video';
  status: 'draft' | 'scheduled' | 'published';
  createdAt: string;
  scheduledFor?: string;
  channels: string[];
}

export default function ContentDistributionPage() {
  const { toast } = useToast();
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [isDistributing, setIsDistributing] = useState(false);

  // Distribution channels
  const [channels, setChannels] = useState<DistributionChannel[]>([
    { id: 'website', name: 'Church Website', icon: Globe, enabled: true, connected: true },
    { id: 'facebook', name: 'Facebook', icon: Facebook, enabled: true, connected: true },
    { id: 'twitter', name: 'X (Twitter)', icon: Twitter, enabled: false, connected: true },
    { id: 'instagram', name: 'Instagram', icon: Instagram, enabled: false, connected: false },
    { id: 'youtube', name: 'YouTube', icon: Youtube, enabled: true, connected: true },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, enabled: false, connected: false },
  ]);

  // Sample content items
  const [contentItems] = useState<ContentItem[]>([
    {
      id: '1',
      title: 'Sunday Sermon: Walking in Faith',
      type: 'sermon',
      status: 'published',
      createdAt: '2024-01-15',
      channels: ['website', 'facebook', 'youtube'],
    },
    {
      id: '2',
      title: 'Weekly Devotional: Finding Peace',
      type: 'devotional',
      status: 'scheduled',
      createdAt: '2024-01-14',
      scheduledFor: '2024-01-20',
      channels: ['website', 'facebook'],
    },
    {
      id: '3',
      title: 'Youth Ministry Update',
      type: 'article',
      status: 'draft',
      createdAt: '2024-01-13',
      channels: [],
    },
  ]);

  const toggleChannel = (channelId: string) => {
    setChannels(prev => prev.map(ch =>
      ch.id === channelId ? { ...ch, enabled: !ch.enabled } : ch
    ));
  };

  const handleDistribute = async () => {
    if (!selectedContent) {
      toast({
        title: "No content selected",
        description: "Please select content to distribute.",
        variant: "destructive",
      });
      return;
    }

    const enabledChannels = channels.filter(ch => ch.enabled && ch.connected);
    if (enabledChannels.length === 0) {
      toast({
        title: "No channels enabled",
        description: "Please enable at least one connected channel.",
        variant: "destructive",
      });
      return;
    }

    setIsDistributing(true);

    // Simulate distribution
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsDistributing(false);
    toast({
      title: "Content distributed",
      description: `Successfully distributed to ${enabledChannels.length} channel(s).`,
    });
  };

  const getStatusBadge = (status: ContentItem['status']) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />Published</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Scheduled</Badge>;
      case 'draft':
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Draft</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Content Distribution Center
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Distribute your sermons, lessons, and videos across multiple platforms
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
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Content Selection */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Select Content to Distribute
                    </CardTitle>
                    <CardDescription>
                      Choose sermons, articles, or devotionals to share across platforms
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {contentItems.map(item => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedContent(item.id)}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedContent === item.id
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{item.title}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {item.type.charAt(0).toUpperCase() + item.type.slice(1)} • Created {item.createdAt}
                            </p>
                          </div>
                          {getStatusBadge(item.status)}
                        </div>
                        {item.channels.length > 0 && (
                          <div className="mt-2 flex gap-1">
                            {item.channels.map(ch => {
                              const channel = channels.find(c => c.id === ch);
                              if (!channel) return null;
                              const Icon = channel.icon;
                              return (
                                <span key={ch} className="p-1 bg-gray-100 dark:bg-gray-800 rounded">
                                  <Icon className="w-3 h-3" />
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Schedule Options */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Schedule Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Distribution Time</Label>
                        <Select defaultValue="now">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="now">Publish Now</SelectItem>
                            <SelectItem value="schedule">Schedule for Later</SelectItem>
                            <SelectItem value="optimal">Optimal Time (AI)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Date & Time</Label>
                        <Input type="datetime-local" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Distribution Channels */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Share2 className="w-5 h-5" />
                      Distribution Channels
                    </CardTitle>
                    <CardDescription>
                      Select where to publish your content
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {channels.map(channel => {
                      const Icon = channel.icon;
                      return (
                        <div key={channel.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-gray-600" />
                            <div>
                              <p className="font-medium text-sm">{channel.name}</p>
                              {!channel.connected && (
                                <p className="text-xs text-amber-600">Not connected</p>
                              )}
                            </div>
                          </div>
                          <Switch
                            checked={channel.enabled}
                            onCheckedChange={() => toggleChannel(channel.id)}
                            disabled={!channel.connected}
                          />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                <Button
                  className="w-full"
                  onClick={handleDistribute}
                  disabled={isDistributing || !selectedContent}
                >
                  {isDistributing ? (
                    <>Distributing...</>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Distribute Content
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="video">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Video Upload */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="w-5 h-5" />
                      Video Distribution Hub
                    </CardTitle>
                    <CardDescription>
                      Upload and distribute video content across YouTube, social media, and more
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Upload Video File
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Drag and drop your video file here, or click to browse
                      </p>
                      <Button variant="outline">
                        Select Video
                      </Button>
                      <p className="text-xs text-gray-400 mt-4">
                        Supported formats: MP4, MOV, AVI, WebM (max 2GB)
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Video Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Video Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Title</Label>
                      <Input placeholder="Enter video title" />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <textarea
                        className="w-full min-h-[100px] p-3 border rounded-md"
                        placeholder="Enter video description..."
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Category</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sermon">Sermon</SelectItem>
                            <SelectItem value="worship">Worship</SelectItem>
                            <SelectItem value="teaching">Teaching</SelectItem>
                            <SelectItem value="testimony">Testimony</SelectItem>
                            <SelectItem value="event">Event</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Visibility</Label>
                        <Select defaultValue="public">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="unlisted">Unlisted</SelectItem>
                            <SelectItem value="members">Members Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Video Channels */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Youtube className="w-5 h-5 text-red-500" />
                      Video Platforms
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Youtube className="w-5 h-5 text-red-500" />
                        <span className="font-medium">YouTube</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Connected</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Facebook className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Facebook Video</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Connected</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-purple-600" />
                        <span className="font-medium">Church Website</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Connected</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Share</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        value="https://church.com/videos/xyz"
                        className="text-sm"
                      />
                      <Button variant="outline" size="icon">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button variant="outline" className="w-full">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Preview Video
                    </Button>
                  </CardContent>
                </Card>

                <Button className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload & Distribute Video
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
