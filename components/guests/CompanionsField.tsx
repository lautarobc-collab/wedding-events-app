"use client";

import { useFieldArray, Controller, type Control } from "react-hook-form";
import { DietarySelect } from "@/components/DietarySelect";
import type { GuestFormValues } from "@/lib/validations/guest";

export function CompanionsField({ control }: { control: Control<GuestFormValues> }) {
  const { fields, append, remove } = useFieldArray({ control, name: "companions" });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Acompañantes</label>
        <button
          type="button"
          onClick={() => append({ name: "", is_child: false, dietary_restrictions: "" })}
          className="text-sm text-neutral-600 underline"
        >
          + Añadir acompañante
        </button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-neutral-400">Sin acompañantes.</p>
      )}

      {fields.map((field, index) => (
        <div
          key={field.id}
          className="flex flex-col gap-2 rounded border border-neutral-200 p-2"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Controller
              name={`companions.${index}.name`}
              control={control}
              render={({ field: nameField }) => (
                <input
                  placeholder="Nombre (opcional)"
                  value={nameField.value ?? ""}
                  onChange={nameField.onChange}
                  className="flex-1 rounded border border-neutral-300 px-2 py-1"
                />
              )}
            />
            <Controller
              name={`companions.${index}.is_child`}
              control={control}
              render={({ field: childField }) => (
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={childField.value}
                    onChange={(event) => childField.onChange(event.target.checked)}
                  />
                  Niño
                </label>
              )}
            />
            <button
              type="button"
              onClick={() => remove(index)}
              className="text-sm text-red-600 underline"
            >
              Quitar
            </button>
          </div>
          <Controller
            name={`companions.${index}.dietary_restrictions`}
            control={control}
            render={({ field: dietaryField }) => (
              <DietarySelect
                value={dietaryField.value ?? ""}
                onChange={dietaryField.onChange}
              />
            )}
          />
        </div>
      ))}
    </div>
  );
}
