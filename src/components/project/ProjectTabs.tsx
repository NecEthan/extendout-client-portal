"use client";

import { useState } from "react";
import { OverviewTab } from "@/components/project/OverviewTab";
import { DocumentsTab } from "@/components/project/DocumentsTab";
import { PhotosTab } from "@/components/project/PhotosTab";
import { PeopleTab } from "@/components/project/PeopleTab";
import type { Project } from "@/interfaces/project-interface";
import type { ProjectTab } from "@/types/projectTab-type";

const TABS: ProjectTab[] = ["Overview", "Documents", "Photos", "People"];

export function ProjectTabs({ project }: { project: Project }) {
  const [activeTab, setActiveTab] = useState<ProjectTab>("Overview");

  return (
    <div className="flex flex-col gap-6">
      <div role="tablist" className="flex gap-1 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={
              activeTab === tab
                ? "-mb-px border-b-2 border-primary px-4 py-2 text-sm font-medium"
                : "px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
            }
          >
            {tab}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {activeTab === "Overview" && <OverviewTab />}
        {activeTab === "Documents" && <DocumentsTab project={project} />}
        {activeTab === "Photos" && <PhotosTab projectId={project.id} />}
        {activeTab === "People" && <PeopleTab />}
      </div>
    </div>
  );
}
