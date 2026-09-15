import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CurrencyUnit } from "@/lib/utils/currency";

interface AmountInputProps {
  id: string;
  label: string;
  amount: string;
  unit: CurrencyUnit;
  onAmountChange: (value: string) => void;
  onUnitChange: (value: CurrencyUnit) => void;
  required?: boolean;
  placeholder?: string;
}

/** Rupee amount input paired with a Lac/Cr unit selector, e.g. "3.5" + "Cr". */
export function AmountInput({
  id,
  label,
  amount,
  unit,
  onAmountChange,
  onUnitChange,
  required,
  placeholder = "3.5",
}: AmountInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <Input
          id={id}
          type="number"
          min={0}
          step="any"
          required={required}
          placeholder={placeholder}
          value={amount}
          onChange={(event) => onAmountChange(event.target.value)}
          className="flex-1"
        />
        <Select value={unit} onValueChange={(value) => onUnitChange(value as CurrencyUnit)}>
          <SelectTrigger id={`${id}-unit`} className="w-22">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lac">Lac</SelectItem>
            <SelectItem value="cr">Cr</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
