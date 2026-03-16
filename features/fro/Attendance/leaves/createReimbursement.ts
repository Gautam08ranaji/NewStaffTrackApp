// features/reimbursement/createReimbursement.ts

import { apiRequest } from "@/features/api/callApi";

export type AttachmentPayload = {
  fileName: string;
  filePath: string;
  fileSize: number;
  contentType: string;
  documentType: string;
  documentName: string;
  mimeType: string;
  fileData: string; // base64
};

export type ExpenseTypePayload = {
  expenseType: string;
  amount: number;
  expenseDate: string;
  remarks: string;
  attachment?: AttachmentPayload;
};

type CreateReimbursementParams = {
  taskNumber: string;
  amount: number;
  remarks: string;
  userId: string;
  expenseTypes: ExpenseTypePayload[];
  token: string;
  csrfToken?: string;
};

export const createReimbursement = async ({
  taskNumber,
  amount,
  remarks,
  userId,
  expenseTypes,
  token,
  csrfToken,
}: CreateReimbursementParams) => {
  const payload = {
    taskNumber,
    amount,
    remarks,
    userId,
    expenseTypes,
  };

  return apiRequest({
    method: "POST",
    url: `/Reimbursement/createReimbursement`,
    data: payload,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json-patch+json",
      ...(csrfToken && { "X-CSRF-TOKEN": csrfToken }),
    },
  });
};