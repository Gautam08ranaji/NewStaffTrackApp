import apiClient from "./masterApiClient";

export const getMasterListApi = async (
  apiUrl: string,
  params: {
    pageNumber: number;
    pageSize: number;
  },
) => {
  try {
    const { data } = await apiClient.get(apiUrl, {
      params: {
        PageNumber: params.pageNumber,
        PageSize: params.pageSize,
      },
      headers: {
        Accept: "application/json",
      },
    });

    return data;
  } catch (error: any) {
    throw error;
  }
};
