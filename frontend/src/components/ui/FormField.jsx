"use client";

import { Controller } from "react-hook-form";
import { Input, Select, Textarea, Label } from "./Form";

export function FormField({
  control,
  name,
  label,
  type = "text",
  placeholder,
  required = false,
  options = [],
  isSelect = false,
  isTextarea = false,
  error,
  ...props
}) {
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          if (isSelect) {
            return (
              <Select {...field} {...props}>
                <option value="">Selecione uma opção</option>
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            );
          }

          if (isTextarea) {
            return <Textarea {...field} placeholder={placeholder} {...props} />;
          }

          return (
            <Input
              {...field}
              type={type}
              placeholder={placeholder}
              required={required}
              {...props}
            />
          );
        }}
      />
      {error && <p className="text-xs text-red-600">{error.message}</p>}
    </div>
  );
}
