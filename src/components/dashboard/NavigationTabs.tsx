import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const NavigationTabs = ({ activeTab, onTabChange }: { 
  activeTab: string; 
  onTabChange: (tab: string) => void;
}) => {
  return (
    <div className="bg-white border-b px-8 py-3 shadow-sm">
      <div className="max-w-[1800px] mx-auto">
        <Tabs value={activeTab} onValueChange={onTabChange}>
          <TabsList className="bg-transparent border-0 p-0 gap-2">
            <TabsTrigger 
              value="dataDashboard" 
              className="rounded-lg px-6 py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-100"
            >
              Data Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="data-assets" 
              className="rounded-lg px-6 py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-100"
            >
              Data Assets Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="compliance" 
              className="rounded-lg px-6 py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-100"
            >
              Compliance
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="rounded-lg px-6 py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-100"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="lineage" 
              className="rounded-lg px-6 py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-100"
            >
              Lineage
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};