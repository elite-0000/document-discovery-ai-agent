
import { FileText, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DocumentSourceProps {
  title: string;
  relevance: number;
  onClick?: () => void;
}

const DocumentSource = ({ title, relevance, onClick }: DocumentSourceProps) => {
  return (
    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex items-center space-x-2 flex-1 min-w-0">
        <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
        <span className="text-sm truncate">{title}</span>
      </div>
      <div className="flex items-center space-x-2 ml-2">
        <Badge variant="outline" className="text-xs">
          {Math.round(relevance * 100)}%
        </Badge>
        <Button variant="ghost" size="sm" onClick={onClick}>
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default DocumentSource;
