"use client";

import { useState } from "react";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import Toast from "@/components/Toast";
import InventoryHeader from "@/components/inventory/InventoryHeader";
import { useInventory } from "@/components/inventory/InventoryProvider";
import InventorySidebar from "@/components/inventory/InventorySidebar";
import MobileBottomNav from "@/components/inventory/MobileBottomNav";
import { useTheme } from "@/hooks/useTheme";

type InventoryShellProps = {
  children: React.ReactNode;
  productCount: number;
};

export default function InventoryShell({ children, productCount }: InventoryShellProps) {
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    deleteTarget,
    deletingId,
    cancelDelete,
    confirmDelete,
    toast,
    dismissToast,
  } = useInventory();

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <InventorySidebar
        open={sidebarOpen}
        productCount={productCount}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">
        <InventoryHeader
          theme={theme}
          onOpenSidebar={() => setSidebarOpen(true)}
          onToggleTheme={toggleTheme}
        />

        <main className="flex-1 p-4 sm:p-6">{children}</main>

        <MobileBottomNav
          onOpenMenu={() => setSidebarOpen(true)}
        />
      </div>

      <DeleteConfirmModal
        open={deleteTarget !== null}
        productName={deleteTarget?.name ?? "this product"}
        loading={deletingId !== null}
        onCancel={cancelDelete}
        onConfirm={() => void confirmDelete()}
      />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={dismissToast} />
      )}
    </div>
  );
}
