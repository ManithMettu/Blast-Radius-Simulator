"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateService, useUpdateService } from "@/hooks/use-services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CRITICALITY_LEVELS, SERVICE_STATUSES } from "@/lib/constants";
import { CRITICALITY_LABELS, STATUS_LABELS } from "@/lib/utils";
import type { Service } from "@/types";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  owner: z.string().optional(),
  criticality: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  status: z.enum(["HEALTHY", "DEGRADED", "FAILED"]),
});

type FormValues = z.infer<typeof schema>;

interface ServiceFormProps {
  service?: Service | null;
  onSuccess?: () => void;
}

export function ServiceForm({ service, onSuccess }: ServiceFormProps) {
  const createService = useCreateService();
  const updateService = useUpdateService();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      owner: "",
      criticality: "MEDIUM",
      status: "HEALTHY",
    },
  });

  useEffect(() => {
    if (service) {
      reset({
        name: service.name,
        description: service.description ?? "",
        owner: service.owner ?? "",
        criticality: service.criticality,
        status: service.status,
      });
    }
  }, [service, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (service) {
      await updateService.mutateAsync({ id: service.id, input: values });
    } else {
      await createService.mutateAsync(values);
      reset();
    }
    onSuccess?.();
  });

  const isPending = createService.isPending || updateService.isPending;
  const error = createService.error ?? updateService.error;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{service ? "Edit service" : "Create service"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-4">
          <Field label="Name" error={errors.name?.message}>
            <Input {...register("name")} placeholder="payment-service" />
          </Field>

          <Field label="Description" error={errors.description?.message}>
            <Input {...register("description")} placeholder="Handles payment processing" />
          </Field>

          <Field label="Owner" error={errors.owner?.message}>
            <Input {...register("owner")} placeholder="payments-team" />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Criticality">
              <Select {...register("criticality")}>
                {CRITICALITY_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {CRITICALITY_LABELS[level]}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Status">
              <Select {...register("status")}>
                {SERVICE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          {error ? <p className="text-sm text-rose-400">{error.message}</p> : null}

          <Button type="submit" isLoading={isPending}>
            {service ? "Save changes" : "Create service"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="text-slate-700">{label}</span>
      {children}
      {error ? <span className="text-xs text-rose-400">{error}</span> : null}
    </label>
  );
}
