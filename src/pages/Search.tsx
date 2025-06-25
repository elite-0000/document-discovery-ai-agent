
import { useState } from 'react';
import { Search as SearchIcon, Filter, FileText, Calendar, User, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Search = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const mockResults = [
    {
      id: 1,
      title: 'Annual Financial Report 2023',
      content: 'Our revenue grew by 15% year-over-year, reaching $2.3 billion in total revenue. The growth was driven primarily by our cloud services division...',
      document: 'Annual_Report_2023.pdf',
      page: 12,
      relevance: 0.95,
      category: 'Financial',
      date: '2024-01-15'
    },
    {
      id: 2,
      title: 'Market Analysis - Q4 Results',
      content: 'The market analysis shows strong performance in the technology sector with increasing demand for AI solutions. Key metrics indicate...',
      document: 'Market_Analysis_Q4.xlsx',
      page: 3,
      relevance: 0.89,
      category: 'Analysis',
      date: '2024-01-10'
    },
    {
      id: 3,
      title: 'Strategic Planning Overview',
      content: 'Our strategic initiatives for 2024 focus on expanding our AI capabilities and improving customer experience through innovative solutions...',
      document: 'Strategy_2024.pptx',
      page: 8,
      relevance: 0.87,
      category: 'Strategy',
      date: '2024-01-05'
    }
  ];

  const handleSearch = () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    // Simulate search
    setTimeout(() => {
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 1000);
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <mark key={index} className="bg-yellow-200">{part}</mark> : part
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <SearchIcon className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Advanced Search</h1>
            </div>
            <nav className="flex space-x-6">
              <Link to="/" className="text-gray-600 hover:text-gray-900">Chat</Link>
              <Link to="/documents" className="text-gray-600 hover:text-gray-900">Documents</Link>
              <Link to="/search" className="text-blue-600 font-medium">Search</Link>
              <Link to="/admin" className="text-gray-600 hover:text-gray-900">Admin</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Semantic Document Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Main Search */}
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search across all documents using natural language..."
                    className="pl-10 h-12 text-lg"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch} disabled={isSearching} className="h-12 px-8">
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
              </div>

              {/* Search Tabs */}
              <Tabs defaultValue="semantic" className="w-full">
                <TabsList>
                  <TabsTrigger value="semantic">Semantic Search</TabsTrigger>
                  <TabsTrigger value="keyword">Keyword Search</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced Filters</TabsTrigger>
                </TabsList>
                
                <TabsContent value="semantic" className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Use natural language to find relevant content. Our AI understands context and meaning.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                      "financial performance"
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                      "market trends"
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                      "strategic initiatives"
                    </Badge>
                  </div>
                </TabsContent>
                
                <TabsContent value="keyword" className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Search for exact keywords and phrases within documents.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input placeholder="Keywords..." />
                    <Input placeholder="Exact phrase..." />
                    <Input placeholder="Exclude words..." />
                  </div>
                </TabsContent>
                
                <TabsContent value="advanced" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Document Type</label>
                      <select className="w-full p-2 border rounded">
                        <option>All Types</option>
                        <option>PDF</option>
                        <option>Word</option>
                        <option>Excel</option>
                        <option>PowerPoint</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Date Range</label>
                      <select className="w-full p-2 border rounded">
                        <option>All Time</option>
                        <option>Last 30 days</option>
                        <option>Last 90 days</option>
                        <option>Last year</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Category</label>
                      <select className="w-full p-2 border rounded">
                        <option>All Categories</option>
                        <option>Financial</option>
                        <option>Strategic</option>
                        <option>Technical</option>
                        <option>Legal</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Relevance</label>
                      <select className="w-full p-2 border rounded">
                        <option>All Results</option>
                        <option>High (>0.8)</option>
                        <option>Medium (>0.6)</option>
                        <option>Low (>0.4)</option>
                      </select>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {searchResults.length > 0 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                Search Results ({searchResults.length})
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <select className="text-sm border rounded px-2 py-1">
                  <option>Relevance</option>
                  <option>Date</option>
                  <option>Document Name</option>
                </select>
              </div>
            </div>

            {searchResults.map((result) => (
              <Card key={result.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-800 cursor-pointer">
                        {highlightText(result.title, query)}
                      </h3>
                      <p className="text-gray-600 mt-2 leading-relaxed">
                        {highlightText(result.content, query)}
                      </p>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-sm font-medium text-green-600">
                        {Math.round(result.relevance * 100)}% match
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <FileText className="h-4 w-4" />
                        <span>{result.document}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>Page {result.page}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{result.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{result.category}</Badge>
                      <Button variant="outline" size="sm">
                        View Document
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {searchResults.length === 0 && query && !isSearching && (
          <Card>
            <CardContent className="text-center py-12">
              <SearchIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500">
                Try adjusting your search terms or using different keywords.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Search;
