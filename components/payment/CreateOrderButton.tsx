"use client";

import { useActionState } from "react";
import { createSepayOrder } from "@/lib/actions/payment";
import { Button } from "@/components/ui/Button";
import { PROGRAM_PRICE_LABEL } from "@/lib/constants";

export function CreateOrderButton() {
  const [state, action, pending] = useActionState(createSepayOrder, undefined);

  return (
    <form action={action}>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Đang tạo đơn hàng..." : `Xác nhận thanh toán ${PROGRAM_PRICE_LABEL}`}
      </Button>
      {state?.error && <p className="mt-2 text-center text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
