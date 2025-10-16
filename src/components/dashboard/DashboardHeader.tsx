import { Globe, RefreshCw, Download, Settings, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const DashboardHeader = () => {
  return (
    <header 
      className="border-b px-8 py-5 w-full shadow-sm relative overflow-hidden"
      style={{ 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #dbeafe 100%)'
      }}
    >
      <div className="flex items-center justify-between max-w-[1800px] mx-auto relative z-10">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img src="/req_assets/images.png" alt="Indigo Airlines" className="h-11 w-11" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">PRISM - Data Assets</h1>
              <p className="text-sm text-gray-500">Indigo Airlines • Meta Data Assets Analytics</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
            <Globe className="h-4 w-4 text-indigo-600" />
            <span className="font-medium">Production</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
            <span>Last Sync: 2 min ago</span>
          </div>
          
          <Button variant="outline" size="sm" className="h-9 rounded-lg border-gray-300 hover:bg-gray-50">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          
          <Button variant="outline" size="sm" className="h-9 rounded-lg border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          
          <div className="flex items-center space-x-1 ml-2">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg hover:bg-gray-100">
              <Bell className="h-4 w-4 text-gray-600" />
            </Button>
            
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg hover:bg-gray-100">
              <Settings className="h-4 w-4 text-gray-600" />
            </Button>
            
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg hover:bg-gray-100">
              <User className="h-4 w-4 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};