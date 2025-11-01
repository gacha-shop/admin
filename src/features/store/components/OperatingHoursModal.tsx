import { useState, useEffect } from "react";
import type { CheckedState } from "@radix-ui/react-checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { BusinessHoursInput } from "./BusinessHoursInput";
import type { BusinessHours } from "../types/store.types";

interface OperatingHoursModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  is24Hours: boolean;
  businessHours: BusinessHours | null;
  onSave: (is24Hours: boolean, businessHours: BusinessHours | null) => void;
}

export function OperatingHoursModal({
  open,
  onOpenChange,
  is24Hours: initialIs24Hours,
  businessHours: initialBusinessHours,
  onSave,
}: OperatingHoursModalProps) {
  const [is24Hours, setIs24Hours] = useState(initialIs24Hours);
  const [businessHours, setBusinessHours] = useState<BusinessHours | null>(
    initialBusinessHours
  );

  // 모달이 열릴 때 props의 값으로 state를 동기화
  useEffect(() => {
    if (open) {
      setIs24Hours(initialIs24Hours);
      setBusinessHours(initialBusinessHours);
    }
  }, [open, initialIs24Hours, initialBusinessHours]);

  const handleSave = () => {
    if (is24Hours) {
      onSave(true, null);
    } else {
      // 모든 요일에 대해 명시적으로 값을 설정 (체크 안한 요일은 {closed: true})
      const completeSchedule: BusinessHours = {
        schedule: {
          monday: businessHours?.schedule?.monday || { closed: true },
          tuesday: businessHours?.schedule?.tuesday || { closed: true },
          wednesday: businessHours?.schedule?.wednesday || { closed: true },
          thursday: businessHours?.schedule?.thursday || { closed: true },
          friday: businessHours?.schedule?.friday || { closed: true },
          saturday: businessHours?.schedule?.saturday || { closed: true },
          sunday: businessHours?.schedule?.sunday || { closed: true },
        },
        note: businessHours?.note,
        breakTime: businessHours?.breakTime,
      };
      onSave(false, completeSchedule);
    }
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Reset to initial values
    setIs24Hours(initialIs24Hours);
    setBusinessHours(initialBusinessHours);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>운영 정보 설정</DialogTitle>
          <DialogDescription>
            스토어의 운영시간을 설정해주세요. 24시간 운영이거나 요일별로
            다르게 설정할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 24시간 영업 */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is24hours"
              checked={is24Hours}
              onCheckedChange={(checked: CheckedState) => setIs24Hours(checked === true)}
            />
            <Label htmlFor="is24hours" className="font-medium">
              24시간 영업
            </Label>
          </div>

          {/* 요일별 영업시간 */}
          {!is24Hours && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold">요일별 영업시간</Label>
              <BusinessHoursInput
                value={businessHours}
                onChange={setBusinessHours}
              />
            </div>
          )}

          {is24Hours && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                24시간 영업으로 설정되었습니다. 요일별 영업시간은 저장되지
                않습니다.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            취소
          </Button>
          <Button type="button" onClick={handleSave}>
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
