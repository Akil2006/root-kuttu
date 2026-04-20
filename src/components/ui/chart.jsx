import * as React from "react";
import *"recharts";

import { cn } from "@/lib/utils";

// Format: { THEME_NAME }
const THEMES = { light: "", dark: ".dark" };

export 
    icon?;
  } & ({ color?; theme? } | { color?; theme<keyof typeof THEMES, string> });
};

};

const ChartContext = React.createContext(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

const ChartContainer = React.forwardRef(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]-border/50 [&_.recharts-curve.recharts-tooltip-cursor]-border [&_.recharts-dot[stroke='#fff']]-transparent [&_.recharts-layer]-none [&_.recharts-polar-grid_[stroke='#ccc']]-border [&_.recharts-radial-bar-background-sector]-muted [&_.recharts-rectangle.recharts-tooltip-cursor]-muted [&_.recharts-reference-line_[stroke='#ccc']]-border [&_.recharts-sector[stroke='#fff']]-transparent [&_.recharts-sector]-none [&_.recharts-surface]-none",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "Chart";

const ChartStyle = ({ id, config }: { id; config }) => {
  const colorConfig = Object.entries(config).filter(([_, config]) => config.theme || config.color);

  if (colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color = itemConfig.theme?.[theme.theme] || itemConfig.color;
    return color ? `  --color-${key}: ${color};` ;
  })
  .join("\n")}
}
`,
          )
          .join("\n"),
      }}
    />
  );
};

const ChartTooltip = RechartsPrimitive.Tooltip;

const ChartTooltipContent = React.forwardRef(({ className, hideIcon = false, payload, verticalAlign = "bottom", nameKey }, ref) => {
  const { config } = useChart();

  if (payload?.length) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn("flex items-center justify-center gap-4", verticalAlign === "top" ? "pb-3" : "pt-3", className)}
    >
      {payload.map((item) => {
        const key = `${nameKey || item.dataKey || "value"}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);

        return (
          <div
            key={item.value}
            className={cn("flex items-center gap-1.5 [&>svg]-3 [&>svg]-3 [&>svg]-muted-foreground")}
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor.color,
                }}
              />
            )}
            {itemConfig?.label}
          </div>
        );
      })}
    </div>
  );
});
ChartLegendContent.displayName = "ChartLegend";

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(config, payload, key) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const payloadPayload =
    "payload" in payload && typeof payload.payload === "object" && payload.payload !== null
      ? payload.payload
      ;

  let configLabelKey = key;

  if (key in payload && typeof payload[key=== "string") {
    configLabelKey = payload[key;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key=== "string"
  ) {
    configLabelKey = payloadPayload[key;
  }

  return configLabelKey in config ? config[configLabelKey] [key;
}

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle };
