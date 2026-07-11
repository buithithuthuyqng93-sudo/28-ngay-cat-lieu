"use client";

import { useActionState } from "react";
import { saveLead } from "@/lib/actions/lead";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SURVEY_ROLES } from "@/lib/constants";

export function LeadForm() {
  const [state, action, pending] = useActionState(saveLead, undefined);

  return (
    <Card className="p-6">
      <p className="mb-1 text-sm font-bold text-gray-900">Trước khi thanh toán, cho mình biết thêm về bạn</p>
      <p className="mb-5 text-xs text-gray-500">
        Giúp mình hỗ trợ bạn tốt hơn trong suốt 28 ngày — chỉ mất chưa tới 1 phút.
      </p>

      <form action={action} className="space-y-4">
        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-gray-700">
            Số điện thoại
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            placeholder="09xxxxxxxx"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
          {state?.errors?.phone && <p className="mt-1 text-xs text-red-600">{state.errors.phone[0]}</p>}
        </div>

        <div>
          <label htmlFor="pharmacyName" className="mb-1.5 block text-sm font-medium text-gray-700">
            Tên nhà thuốc / quầy thuốc
          </label>
          <input
            id="pharmacyName"
            name="pharmacyName"
            type="text"
            required
            placeholder="VD: Nhà thuốc An Khang"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
          {state?.errors?.pharmacyName && (
            <p className="mt-1 text-xs text-red-600">{state.errors.pharmacyName[0]}</p>
          )}
        </div>

        <div>
          <p className="mb-1.5 block text-sm font-medium text-gray-700">Bạn đang làm việc tại</p>
          <div className="grid grid-cols-2 gap-2">
            {SURVEY_ROLES.map((role) => (
              <label
                key={role.value}
                className="flex items-center gap-2 rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-700 has-checked:border-primary-500 has-checked:bg-primary-50 has-checked:text-primary-700"
              >
                <input type="radio" name="surveyRole" value={role.value} required className="accent-primary-600" />
                {role.label}
              </label>
            ))}
          </div>
          {state?.errors?.surveyRole && (
            <p className="mt-1 text-xs text-red-600">{state.errors.surveyRole[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="surveyChallenge" className="mb-1.5 block text-sm font-medium text-gray-700">
            Khó khăn lớn nhất khi tư vấn khách hàng hiện nay là gì?
          </label>
          <textarea
            id="surveyChallenge"
            name="surveyChallenge"
            required
            rows={3}
            placeholder="Chia sẻ ngắn gọn giúp mình nhé..."
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
          {state?.errors?.surveyChallenge && (
            <p className="mt-1 text-xs text-red-600">{state.errors.surveyChallenge[0]}</p>
          )}
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Đang lưu..." : "Tiếp tục"}
        </Button>
      </form>
    </Card>
  );
}
