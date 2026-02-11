import type { TopupsService, TopupPurchaseResult } from "./topups.service";
import type { ServiceResponse } from "../types";
import type { TelcoOperator } from "@/types";
import { ok } from "../types";

const operators: TelcoOperator[] = [
  {
    id: "a1",
    name: "A1 Hrvatska",
    logo: "A1",
    color: "#E4002B",
    amounts: [2, 5, 10, 15, 20, 25, 50],
  },
  {
    id: "t-mobile",
    name: "T-Mobile",
    logo: "TM",
    color: "#E20074",
    amounts: [2, 5, 10, 15, 20, 25, 50],
  },
  {
    id: "telemach",
    name: "Telemach",
    logo: "TE",
    color: "#78BE20",
    amounts: [2, 5, 10, 15, 20, 25, 50],
  },
];

async function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export const mockTopupsService: TopupsService = {
  async getOperators(): Promise<ServiceResponse<TelcoOperator[]>> {
    await delay();
    return ok(operators);
  },

  async purchase(req): Promise<ServiceResponse<TopupPurchaseResult>> {
    await delay(600);
    const operator = operators.find((o) => o.id === req.operatorId);
    return ok({
      transactionId: crypto.randomUUID(),
      operator: operator?.name ?? req.operatorId,
      amount: req.amount,
      phoneNumber: req.phoneNumber,
      status: "completed",
    });
  },
};
