
import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

const FolderTabs = TabsPrimitive.Root;

const FolderTabsList = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.List
        ref={ref}
        className={cn(
            "flex flex-wrap items-end w-full gap-0.5 pl-2 overflow-visible",
            className
        )}
        {...props}
    />
));
FolderTabsList.displayName = TabsPrimitive.List.displayName;

const FolderTabsTrigger = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Trigger
        ref={ref}
        className={cn(
            "relative inline-flex items-center justify-center whitespace-nowrap rounded-t-lg px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            "bg-muted/60 text-muted-foreground hover:bg-muted/80 border border-transparent border-b-0", // Inactive styling
            "data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:z-10 data-[state=active]:border-border data-[state=active]:border-b-background", // Active styling
            "mb-[-1px]", // Overlap the content border
            className
        )}
        {...props}
    />
));
FolderTabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const FolderTabsContent = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Content
        ref={ref}
        className={cn(
            "rounded-b-lg rounded-tr-lg border border-border bg-background p-6 shadow-sm mt-0",
            "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className
        )}
        {...props}
    />
));
FolderTabsContent.displayName = TabsPrimitive.Content.displayName;

export { FolderTabs, FolderTabsList, FolderTabsTrigger, FolderTabsContent };
