'use client'
import { Tabs, TabsList, TabsPanel, TabsTab } from "@mantine/core";
import { useState } from "react";
import AboutTab from "./AboutTab";

export default function DetailsCardTab() {
  const [activeTab, setActiveTab] = useState<string | null>("about");
  return (
    <Tabs value={activeTab} onChange={setActiveTab}>
      <TabsList mx={"-md"} justify="center" px={"md"} pt={"md"}>
        <TabsTab value="about" w={"45%"} py={"md"} fw={600}>About</TabsTab>
        <TabsTab value="activity"  w={"45%"} py={"md"} fw={600}>Activity</TabsTab>
      </TabsList>

      <TabsPanel value="about" px={0}>
        <AboutTab />
      </TabsPanel>
      <TabsPanel value="activity">Activity panel</TabsPanel>
    </Tabs>
  );
}
