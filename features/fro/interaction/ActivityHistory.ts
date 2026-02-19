// features/interactionActivity/interactionActivityApi.ts
import { apiRequest } from "@/features/api/callApi";

type AddInteractionActivityParams = {
  token: string;
  csrfToken?: string;
  body: {
    activityTime: string;
    activityInteractionId: number;
    activityActionName: string;
    activityDescription: string;
    activityStatus: string;
    activityById: string;
    activityByName?: string;
    activityRelatedTo?: string;
    activityRelatedToId?: number;
    activityRelatedToName?: string;
  };
};

export const addInteractionActivityHistory = async ({
  token,
  csrfToken,
  body,
}: AddInteractionActivityParams) => {
  try {
    const response = await apiRequest({
      method: "POST",
      url: `/InteractionActivityHistory/AddInteractionActivityHistory`,
      data: body,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json-patch+json",
        ...(csrfToken && { "X-CSRF-TOKEN": csrfToken }),
      },
    });

    return response;
  } catch (error: any) {
    console.error("AddInteractionActivityHistory API Error:", error);

    // Normalize error response
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong while adding interaction activity.";

    throw new Error(message);
  }
};
