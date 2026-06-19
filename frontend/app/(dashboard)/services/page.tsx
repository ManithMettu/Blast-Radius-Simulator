"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/states";
import { ServiceForm } from "@/components/services/service-form";
import { ServiceTable } from "@/components/services/service-table";
import type { Service } from "@/types";

export default function ServicesPage() {
  const [editingService, setEditingService] = useState<Service | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Services"
        description="Create and manage services in your distributed system."
      />

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <ServiceForm
          service={editingService}
          onSuccess={() => setEditingService(null)}
        />
        <ServiceTable onEdit={setEditingService} />
      </div>
    </div>
  );
}
