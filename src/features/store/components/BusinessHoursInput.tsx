import type { CheckedState } from "@radix-ui/react-checkbox";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  BusinessHours,
  DaySchedule,
} from "../types/store.types";

const DAYS = [
  { key: "monday", label: "월요일" },
  { key: "tuesday", label: "화요일" },
  { key: "wednesday", label: "수요일" },
  { key: "thursday", label: "목요일" },
  { key: "friday", label: "금요일" },
  { key: "saturday", label: "토요일" },
  { key: "sunday", label: "일요일" },
] as const;

// 시간 옵션 생성 (00:00 ~ 23:30, 30분 단위)
const generateTimeOptions = () => {
  const times: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      times.push(
        `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
      );
    }
  }
  return times;
};

const TIME_OPTIONS = generateTimeOptions();

interface BusinessHoursInputProps {
  value: BusinessHours | null;
  onChange: (value: BusinessHours | null) => void;
}

export function BusinessHoursInput({
  value,
  onChange,
}: BusinessHoursInputProps) {
  const businessHours = value || {
    schedule: {},
    note: "",
    breakTime: "",
  };

  const updateDay = (
    day: string,
    schedule: DaySchedule | undefined
  ) => {
    onChange({
      ...businessHours,
      schedule: {
        ...businessHours.schedule,
        [day]: schedule,
      },
    });
  };

  const copyToWeekdays = (sourceDay: string) => {
    const source =
      businessHours.schedule[
        sourceDay as keyof typeof businessHours.schedule
      ];
    if (!source || "closed" in source) return;

    const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday"];
    const newSchedule = { ...businessHours.schedule };
    weekdays.forEach((day) => {
      newSchedule[day as keyof typeof newSchedule] = { ...source };
    });
    onChange({ ...businessHours, schedule: newSchedule });
  };

  const copyToWeekend = (sourceDay: string) => {
    const source =
      businessHours.schedule[
        sourceDay as keyof typeof businessHours.schedule
      ];
    if (!source || "closed" in source) return;

    onChange({
      ...businessHours,
      schedule: {
        ...businessHours.schedule,
        saturday: { ...source },
        sunday: { ...source },
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* 요일별 영업시간 */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium">요일</th>
              <th className="px-4 py-2 text-left text-sm font-medium w-20">
                영업
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium">
                오픈
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium">
                마감
              </th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {DAYS.map(({ key, label }) => {
              const schedule = businessHours.schedule[key];
              const isOpen = schedule && !("closed" in schedule);

              return (
                <tr key={key} className="border-t">
                  <td className="px-4 py-2 text-sm">{label}</td>
                  <td className="px-4 py-2">
                    <Checkbox
                      checked={isOpen}
                      onCheckedChange={(checked: CheckedState) => {
                        updateDay(
                          key,
                          checked === true
                            ? { open: "10:00", close: "22:00" }
                            : { closed: true }
                        );
                      }}
                    />
                  </td>
                  <td className="px-4 py-2">
                    {isOpen ? (
                      <Select
                        value={schedule.open}
                        onValueChange={(open) =>
                          updateDay(key, { ...schedule, open })
                        }
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_OPTIONS.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-muted-foreground text-sm">─</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {isOpen ? (
                      <Select
                        value={schedule.close}
                        onValueChange={(close) =>
                          updateDay(key, { ...schedule, close })
                        }
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_OPTIONS.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-muted-foreground text-sm">─</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {isOpen && key === "monday" && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToWeekdays(key)}
                        className="text-xs"
                      >
                        평일에 복사
                      </Button>
                    )}
                    {isOpen && key === "saturday" && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToWeekend(key)}
                        className="text-xs"
                      >
                        주말에 복사
                      </Button>
                    )}
                    {!isOpen && (
                      <span className="text-muted-foreground text-sm">
                        휴무
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 브레이크타임 */}
      <div className="space-y-2">
        <Label className="text-sm">브레이크타임 (선택)</Label>
        <Input
          placeholder="예: 15:00-16:00"
          value={businessHours.breakTime || ""}
          onChange={(e) =>
            onChange({ ...businessHours, breakTime: e.target.value })
          }
        />
      </div>

      {/* 비고 */}
      <div className="space-y-2">
        <Label className="text-sm">비고 (선택)</Label>
        <Input
          placeholder="예: 명절 당일 휴무"
          value={businessHours.note || ""}
          onChange={(e) =>
            onChange({ ...businessHours, note: e.target.value })
          }
        />
      </div>
    </div>
  );
}
