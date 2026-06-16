export interface DoctorInvitationResponse {
  invitationId: string;
  institution: {
    id: string;
    name: string;
    type: string;
    logo: string | null;
  };
  message: string;
  specializationRequested?: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  expiresAt?: string;
}

export interface AcceptRejectResponse {
  success: boolean;
  message: string;
  data?: {
    institutionId: string;
    institutionName: string;
    status: string;
  };
}
