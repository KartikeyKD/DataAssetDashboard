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
import { CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
const SideNavigationBar = ({
    gvcData,
    setJsonData
}) => {
    const [selectedSubKey, setSelectedSubKey] = useState<string | null>(null);
    return (
        <Sidebar collapsible="none" className="h-full w-full border border-cyan-400 shadow-lg" style={{ background: 'linear-gradient(to bottom right, #cffafe, #f0f9ff, #eff6ff)' }}
        >
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton className=" flex flex-row items-baseline text-lg font-semibold">
                                    <p>Data Sources (14)
                                    </p>
                                    <p className="text-xs">
                                        GVC Issued(14)
                                    </p>

                                </SidebarMenuButton>
                                {gvcData.map((subItem, index) => {
                                    const key = `DataSources-${index}`;
                                    const isSelected = selectedSubKey === key;
                                    return (
                                        <SidebarMenuSub key={key}>
                                            <SidebarMenuSubItem key={index} className="p-0">
                                                <div
                                                    onClick={() => { setJsonData(subItem); setSelectedSubKey(key); }}
                                                    className={`justify-between p-2 rounded-lg transition-colors flex items-center bg-cyan-100 border-[2.2px] border-[#BBDEFB] hover:bg-gray-50`}
                                                >
                                                    <div className="flex flex-col">
                                                        <span className={`text-[13px] font-semibold text-[#0D47A1]`}>{subItem["Data Source"]}</span>
                                                        <p className={`text-[10px] text-[#263238]`}>Frequency: {subItem.Frequency}</p>
                                                    </div >
                                                    {subItem.GVRs === "Issued" && (
                                                        <Badge className={`${isSelected ? 'bg-white text-black' : 'bg-green-50 text-green-700'} hover:bg-green-50 text-[8px] border-green-200 rounded-lg`}>
                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                            GVC Issued
                                                        </Badge>
                                                    )}
                                                </div>
                                            </SidebarMenuSubItem>
                                        </SidebarMenuSub>
                                    )
                                })}
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}

export default SideNavigationBar