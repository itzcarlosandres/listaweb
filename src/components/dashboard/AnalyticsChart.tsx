"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsChartProps {
  data: { date: string; label: string; views: number; clicks: number }[];
}

export function AnalyticsChart({ data }: AnalyticsChartProps) {
  return (
    <div className="w-full h-72 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#E4572E" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#E4572E" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E4DB" opacity={0.4} />
          <XAxis
            dataKey="label"
            stroke="#A19D93"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#A19D93"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#17150F",
              borderRadius: "1rem",
              border: "1px solid #2E2B23",
              color: "#FAF9F6",
              fontSize: "12px",
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
            }}
            labelStyle={{ fontWeight: "bold", marginBottom: "4px" }}
          />
          <Area
            type="monotone"
            dataKey="views"
            name="Views"
            stroke="#E4572E"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorViews)"
          />
          <Area
            type="monotone"
            dataKey="clicks"
            name="Website Clicks"
            stroke="#10B981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorClicks)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
