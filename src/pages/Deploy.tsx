
import React from 'react';
import DeploymentDashboard from '@/components/deployment/DeploymentDashboard';
import { ApiHealthProvider } from '@/context/ApiHealthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Deploy: React.FC = () => {
  return (
    <ApiHealthProvider>
      <div className="container mx-auto py-4">
        <div className="mb-4">
          <Link to="/extension">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Extension
            </Button>
          </Link>
        </div>
        <DeploymentDashboard />
      </div>
    </ApiHealthProvider>
  );
};

export default Deploy;
