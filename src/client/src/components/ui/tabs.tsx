"use client";

import * as React from "react";

interface TabsContextValue {
  value: string | undefined;
  setValue: (v: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

function Tabs({ defaultValue, children, className }: { defaultValue?: string; children: React.ReactNode; className?: string }) {
  const [value, setValue] = React.useState<string | undefined>(defaultValue);

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

function TabsTrigger({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) return null;
  const active = ctx.value === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      data-state={active ? "active" : "inactive"}
      onClick={() => ctx.setValue(value)}
      className={className}
    >
      {children}
    </button>
  );
}

function TabsContent({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) return null;
  if (ctx.value !== value) return null;
  return <div className={className}>{children}</div>;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
