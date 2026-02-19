// features/interaction/interactionTypes.ts

export type UpdateInteractionPayload = {
  id: number;

  callTypeName?: string;
  callTypeId?: number;

  transactionNumber?: string;

  TaskstatusId?: number;
  TaskstatusName?: string;

  subStatusId?: number;
  subStatusName?: string;

  categoryId?: number;
  categoryName?: string;

  subCategoryId?: number;
  subCategoryName?: string;

  subSubCategoryId?: number;
  subSubCategoryName?: string;

  subject?: string;
  name?: string;
  gender?: string;

  stateId?: number;
  stateName?: string;
  districtId?: number;
  districtName?: string;

  finalDisposition?: string;
  problemReported?: string;
  agentRemarks?: string;
  comment?: string;

  callBack?: string;
  priority?: string;

  contactId?: number;
  contactName?: string;

  teamId?: number;
  teamName?: string;

  source?: string;
  emailId?: string;
  mobileNo?: string;

  userId: string;
  assignToId: string;
  assignToName?: string;

  dateOfIssuesOccured?: string;
  callBackDateTime?: string;

  isTestcall?: boolean;
  isPrankCall?: boolean;
  isBlankCall?: boolean;
  isAbusiveCall?: boolean;
  isCallDrop?: boolean;
  isNotRelatedToElderly?: boolean;

  caseDescription?: string;
  ticketType?: string;

  pinCode?: string;
  alternateNo?: string;

  [key: string]: any;
};
