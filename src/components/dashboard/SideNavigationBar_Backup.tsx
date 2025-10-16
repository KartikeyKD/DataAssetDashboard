import { useState } from "react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { TrendingUp } from "lucide-react";
const SideNavigationBar2 = ({
    gvcData,
    uniquePipelines
}) => {
    const [selectedSubKey, setSelectedSubKey] = useState<string | null>(null);
    return (
    <Sidebar collapsible="none" className="h-full w-full border border-indigo-400 shadow-lg" style={{ background: 'linear-gradient(to bottom right, #e0e7ff, #eff6ff, #f5f3ff)' }}

    // style={{ background: '#231aa5' }}
    >
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton className="text-lg text-black font-semibold">
                                    Pipelines (16)
                                </SidebarMenuButton>
                                <SidebarMenuSub>
                                    <SidebarMenuSubItem className="p-0">
                                        <div>
                                            {uniquePipelines.map((pipeline, index) => {
                                                // Find the data source for this pipeline
                                                const dataSource = gvcData.find(item => item.Pipelines.includes(pipeline));
                                                const key = `Pipeline-${index}`;
                                                const isSelected = selectedSubKey === key;
                                                return (
                                                    <div
                                                        key={index}
                                                        onClick={() => setSelectedSubKey(key)}
                                                        className={`p-2 my-2 rounded-lg bg-indigo-100 transition-colors border border-indigo-500`}
                                                    >
                                                        <div className="flex p-2 items-center justify-between">
                                                            <div className="flex justify-between items-center">
                                                                <TrendingUp className="h-5 w-5 m-2 text-indigo-600" />
                                                                <div title={pipeline} className="overflow-hidden">
                                                                    <h4 className={`font-medium text-[10px] text-gray-900`}>{pipeline}</h4>
                                                                    <p className={`text-[8px] text-gray-500`}>Source: {dataSource?.["Data Source"] || "Unknown"} • Frequency: {dataSource?.Frequency || "N/A"}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </SidebarMenuSubItem>
                                </SidebarMenuSub>

                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}

export default SideNavigationBar2
