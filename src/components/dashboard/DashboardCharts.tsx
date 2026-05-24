"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Item } from "@/db/schema";
import { getStockKind, LOW_STOCK_THRESHOLD } from "@/components/ui/StockBadge";

const PIE_COLORS = ["#b8860b", "#f59e0b", "#a8a29e"];

type DashboardChartsProps = {
  items: Item[];
};

export default function DashboardCharts({ items }: DashboardChartsProps) {
  const statusData = [
    {
      name: "In stock",
      value: items.filter((i) => getStockKind(i.quantity) === "in").length,
    },
    {
      name: "Low stock",
      value: items.filter((i) => getStockKind(i.quantity) === "low").length,
    },
    {
      name: "Out of stock",
      value: items.filter((i) => getStockKind(i.quantity) === "out").length,
    },
  ].filter((d) => d.value > 0);

  const topByValue = [...items]
    .map((item) => ({
      name: item.name.length > 14 ? `${item.name.slice(0, 14)}…` : item.name,
      value: Number(item.price) * item.quantity,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const hasItems = items.length > 0;

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
      <div className="card-surface p-5 sm:p-6">
        <div className="mb-4">
          <h3 className="text-base font-semibold tracking-tight text-[var(--foreground)]">
            Stock health
          </h3>
          <p className="page-subtitle !mt-1 text-sm">
            Distribution by status (low = qty 1–{LOW_STOCK_THRESHOLD - 1})
          </p>
        </div>
        <div className="h-64">
          {hasItems && statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={3}
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
              Add products to see chart data
            </div>
          )}
        </div>
        <div className="mt-3 flex flex-wrap justify-center gap-4">
          {["In stock", "Low stock", "Out of stock"].map((label, i) => (
            <div key={label} className="flex items-center gap-2 text-xs text-[var(--muted)]">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: PIE_COLORS[i] }}
              />
              {label}
            </div>
          ))}
        </div>
      </div>

      <div className="card-surface p-5 sm:p-6">
        <div className="mb-4">
          <h3 className="text-base font-semibold tracking-tight text-[var(--foreground)]">
            Top products by value
          </h3>
          <p className="page-subtitle !mt-1 text-sm">Price × quantity (top 5)</p>
        </div>
        <div className="h-64">
          {topByValue.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topByValue} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "var(--muted)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "var(--muted)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  formatter={(value) => {
                    const n = typeof value === "number" ? value : Number(value);
                    return [`$${Number.isFinite(n) ? n.toFixed(2) : "0.00"}`, "Value"];
                  }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                  }}
                />
                <Bar dataKey="value" fill="var(--primary)" radius={[8, 8, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
              No inventory value to display
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
