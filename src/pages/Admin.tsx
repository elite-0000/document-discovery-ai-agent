
import { useState } from 'react';
import { Settings, Database, Activity, Users, FileText, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const Admin = () => {
  const [systemStatus] = useState({
    vectorDb: 'healthy',
    llamaCloud: 'healthy',
    embedding: 'processing',
    indexing: 'healthy'
  });

  const recentJobs = [
    { id: 1, type: 'Document Ingestion', status: 'completed', documents: 45, startTime: '2024-01-15 10:30', duration: '2m 34s' },
    { id: 2, type: 'Embedding Update', status: 'running', documents: 120, startTime: '2024-01-15 11:15', duration: '5m 12s' },
    { id: 3, type: 'Index Optimization', status: 'completed', documents: 24567, startTime: '2024-01-15 09:00', duration: '15m 23s' },
    { id: 4, type: 'Metadata Refresh', status: 'failed', documents: 78, startTime: '2024-01-15 08:45', duration: '1m 45s' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
      case 'running':
        return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Settings className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">System Administration</h1>
            </div>
            <nav className="flex space-x-6">
              <Link to="/" className="text-gray-600 hover:text-gray-900">Chat</Link>
              <Link to="/documents" className="text-gray-600 hover:text-gray-900">Documents</Link>
              <Link to="/search" className="text-gray-600 hover:text-gray-900">Search</Link>
              <Link to="/admin" className="text-blue-600 font-medium">Admin</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Vector Database</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusIcon(systemStatus.vectorDb)}
                    <span className="text-sm font-semibold">PGVector</span>
                  </div>
                </div>
                <Database className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">LlamaCloud</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusIcon(systemStatus.llamaCloud)}
                    <span className="text-sm font-semibold">Connected</span>
                  </div>
                </div>
                <Zap className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Embedding Service</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusIcon(systemStatus.embedding)}
                    <span className="text-sm font-semibold">Processing</span>
                  </div>
                </div>
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Indexing</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusIcon(systemStatus.indexing)}
                    <span className="text-sm font-semibold">Healthy</span>
                  </div>
                </div>
                <FileText className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Admin Panel */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>System Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Vector Index Usage</span>
                      <span>78%</span>
                    </div>
                    <Progress value={78} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Embedding Queue</span>
                      <span>23 items</span>
                    </div>
                    <Progress value={15} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Storage Usage</span>
                      <span>1.2TB / 2TB</span>
                    </div>
                    <Progress value={60} />
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentJobs.slice(0, 4).map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(job.status)}
                          <div>
                            <p className="text-sm font-medium">{job.type}</p>
                            <p className="text-xs text-gray-500">{job.documents} documents</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="processing" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Processing Jobs</CardTitle>
                  <Button>
                    <Activity className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Documents</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{job.type}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(job.status)}
                            <Badge className={getStatusColor(job.status)}>
                              {job.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{job.documents}</TableCell>
                        <TableCell>{job.startTime}</TableCell>
                        <TableCell>{job.duration}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            View Logs
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vector Database Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Vectors</span>
                    <span className="font-semibold">2,456,789</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Dimensions</span>
                    <span className="font-semibold">1,536</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Index Type</span>
                    <span className="font-semibold">IVFFlat</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Optimization</span>
                    <span className="font-semibold">2 hours ago</span>
                  </div>
                  <Button className="w-full">
                    <Database className="h-4 w-4 mr-2" />
                    Optimize Index
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Embedding Model</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Model</span>
                    <span className="font-semibold">text-embedding-ada-002</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Provider</span>
                    <span className="font-semibold">OpenAI</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg. Processing Time</span>
                    <span className="font-semibold">1.2s per doc</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Success Rate</span>
                    <span className="font-semibold text-green-600">99.7%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">1.2s</div>
                    <div className="text-sm text-gray-600">Avg. Query Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">99.5%</div>
                    <div className="text-sm text-gray-600">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">2.3M</div>
                    <div className="text-sm text-gray-600">Queries/Month</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Embedding Batch Size</label>
                    <input type="number" className="w-full p-2 border rounded" defaultValue="50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Query Results</label>
                    <input type="number" className="w-full p-2 border rounded" defaultValue="20" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Similarity Threshold</label>
                    <input type="number" step="0.01" className="w-full p-2 border rounded" defaultValue="0.7" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Auto-Optimize Interval</label>
                    <select className="w-full p-2 border rounded">
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                    </select>
                  </div>
                </div>
                <Button className="w-full md:w-auto">
                  Save Configuration
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
