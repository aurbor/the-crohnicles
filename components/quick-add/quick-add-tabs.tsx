"use client";

import * as Tabs from "@radix-ui/react-tabs";
import type { ReactNode } from "react";

export function QuickAddTabs({
  foodTab,
  medicationTab,
  symptomTab,
}: {
  foodTab: ReactNode;
  medicationTab: ReactNode;
  symptomTab: ReactNode;
}) {
  return (
    <Tabs.Root defaultValue="food" className="flex flex-col gap-4">
      <Tabs.List className="flex gap-1 rounded-full bg-brand-violet/10 p-1">
        <Tabs.Trigger
          value="food"
          className="flex-1 rounded-full px-3 py-2 text-sm font-semibold text-muted transition-colors data-[state=active]:brand-gradient data-[state=active]:text-white"
        >
          🥤 Food / Drink
        </Tabs.Trigger>
        <Tabs.Trigger
          value="medication"
          className="flex-1 rounded-full px-3 py-2 text-sm font-semibold text-muted transition-colors data-[state=active]:brand-gradient data-[state=active]:text-white"
        >
          💊 Medication
        </Tabs.Trigger>
        <Tabs.Trigger
          value="symptom"
          className="flex-1 rounded-full px-3 py-2 text-sm font-semibold text-muted transition-colors data-[state=active]:brand-gradient data-[state=active]:text-white"
        >
          🚽 Symptom
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="food" className="grid gap-6 sm:grid-cols-2">
        {foodTab}
      </Tabs.Content>
      <Tabs.Content value="medication" className="grid gap-6 sm:grid-cols-2">
        {medicationTab}
      </Tabs.Content>
      <Tabs.Content value="symptom" className="grid gap-6 sm:grid-cols-2">
        {symptomTab}
      </Tabs.Content>
    </Tabs.Root>
  );
}
