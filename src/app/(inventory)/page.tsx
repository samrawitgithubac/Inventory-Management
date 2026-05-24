import DashboardPageClient from "@/components/inventory/DashboardPageClient";
import type { StatusFilter } from "@/types/inventory";

type HomePageProps = {
  searchParams: Promise<{ status?: string }>;
};

function parseStatusFilter(status: string | undefined): StatusFilter {
  if (status === "in" || status === "low" || status === "out") return status;
  return "all";
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { status } = await searchParams;
  return <DashboardPageClient initialStatus={parseStatusFilter(status)} />;
}
