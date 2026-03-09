// features/reimbursement/createReimbursement.ts

import { apiRequest } from "@/features/api/callApi";

type CreateReimbursementParams = {
  taskNumber: string;
  amount: number;
  remarks: string;
  userId: string;
  attachment: any;
  token: string;
  csrfToken?: string;
};

export const createReimbursement = async ({
  taskNumber,
  amount,
  remarks,
  userId,
  attachment,
  token,
  csrfToken,
}: CreateReimbursementParams) => {
  const formData = new FormData();

  formData.append("TaskNumber", taskNumber);
  formData.append("Amount", amount.toString());
  formData.append("Remarks", remarks);
  formData.append("UserId", userId);

  if (attachment) {
    formData.append("Attachments", {
      uri: attachment.uri,
      name: attachment.name || "bill.jpg",
      type: attachment.type || "image/jpeg",
    } as any);
  }

  return apiRequest({
    method: "POST",
    url: `/Reimbursement/createReimbursement`,
    data: formData,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
      ...(csrfToken && { "X-CSRF-TOKEN": csrfToken }),
    },
  });
};