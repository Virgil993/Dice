import { z } from "zod";
import {
  ResponseStatus,
  type AddMessageRequest,
  type AddMessageResponse,
  type AddSwipeRequest,
  type AddSwipeResponse,
  type EnableTotpRequest,
  type EnableTotpResponse,
  type GenerateTotpResponse,
  type GetConversationsResponse,
  type GetExternalUserResponse,
  type GetGamesResponse,
  type GetMessagesResponse,
  type GetUserResponse,
  type GetUsersSortedResponse,
  type ResetPasswordRequest,
  type SendPasswordResetEmailRequest,
  type Status,
  type StatusError,
  type UpdateMessagesReadStatusRequest,
  type UpdateSingularMessageReadStatusRequest,
  type UseBackupCodeRequest,
  type UserCreateResponse,
  type UserLoginRequest,
  type UserLoginResponse,
  type UserUpdateResponse,
  type VerifyTotpRequest,
} from "./models/request";
import axios, { AxiosError, type AxiosResponse } from "axios";
import toast from "react-hot-toast";

const apiErrorSchema = z.object({
  status: z.literal(ResponseStatus.ERROR),
  message: z.string(),
  retryAfter: z.number().optional(),
});

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

instance.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("apiToken");
  const totpTempToken = localStorage.getItem("totpTempToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (totpTempToken) {
    config.headers.Authorization = `Bearer ${totpTempToken}`;
  }
  if (
    config.headers &&
    !(config.headers["Content-Type"] === "multipart/form-data")
  ) {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

instance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError): AxiosResponse<StatusError> => {
    if (
      error.response?.status === 401 &&
      localStorage.getItem("apiToken") !== null
    ) {
      localStorage.removeItem("apiToken");
      localStorage.removeItem("user");
      localStorage.removeItem("totpTempToken");
      window.location.href = "/auth/login";
    }
    try {
      const parsedError = apiErrorSchema.parse(error.response?.data);
      if (
        error.response?.status === 403 &&
        parsedError.message === "User not verified" &&
        window.location.pathname !== "/send-verify-email" &&
        window.location.pathname !== "/verify-email"
      ) {
        console.log("User not verified, redirecting to send-verify-email");
        console.log("window.location.pathname:", window.location.pathname);
        toast.error("Please verify your email to access this feature.");
        window.location.href = "/send-verify-email";
      }
      return {
        status: error.response?.status || 500,
        statusText: error.response?.statusText || "Internal Server Error",
        headers: error.response?.headers || {},

        config: error.config ?? {
          headers: error.request.headers,
        },
        data: parsedError,
      };
    } catch (parsingError) {
      console.error("Error parsing response", parsingError);
      const defaultError = {
        status: ResponseStatus.ERROR,
        message: "Something went wrong on our end. Please try again later.",
      };
      const parsedError = apiErrorSchema.parse(defaultError);
      return {
        status: error.response?.status || 500,
        statusText: error.response?.statusText || "Internal Server Error",
        headers: error.response?.headers || {},
        config: error.config ?? {
          headers: error.request.headers,
        },
        data: parsedError,
      };
    }
  }
);

// USER
export const registerUser = async (payload: FormData) => {
  const response: AxiosResponse<Status<UserCreateResponse>> =
    await instance.post("/api/users/register", payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  return response;
};

export const loginUser = async (payload: UserLoginRequest) => {
  const response: AxiosResponse<Status<UserLoginResponse>> =
    await instance.post("/api/users/login", payload);
  return response;
};

export const getUser = async () => {
  const response: AxiosResponse<Status<GetUserResponse>> = await instance.get(
    "/api/users"
  );
  return response;
};

export const getUserById = async (id: string) => {
  const response: AxiosResponse<Status<GetExternalUserResponse>> =
    await instance.get(`/api/users/single/${id}`);
  return response;
};

export const getUsersSorted = async () => {
  const response: AxiosResponse<Status<GetUsersSortedResponse>> =
    await instance.get("/api/users/sorted");
  return response;
};

export const updateUser = async (payload: FormData) => {
  const response: AxiosResponse<Status<UserUpdateResponse>> =
    await instance.put("/api/users", payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  return response;
};

export const resetPassword = async (
  userId: string,
  token: string,
  payload: ResetPasswordRequest
) => {
  const response: AxiosResponse<Status> = await instance.put(
    `/api/users/reset-password?userId=${userId}&token=${token}`,
    payload
  );
  return response;
};

export const deleteUser = async () => {
  const response: AxiosResponse<Status> = await instance.delete("/api/users");
  return response;
};

// EMAIL

export const sendVerificationEmail = async () => {
  const response: AxiosResponse<Status> = await instance.post(
    "/api/email/send-verify-email"
  );
  return response;
};

export const verifyEmail = async (userId: string, token: string) => {
  const response: AxiosResponse<Status> = await instance.post(
    `/api/email/verify-email?userId=${userId}&token=${token}`
  );
  return response;
};

export const sendPasswordResetEmail = async (
  payload: SendPasswordResetEmailRequest
) => {
  const response: AxiosResponse<Status> = await instance.post(
    "/api/email/send-reset-password-email",
    payload
  );
  return response;
};

// TOTP

export const generateTotp = async () => {
  const response: AxiosResponse<Status<GenerateTotpResponse>> =
    await instance.post("/api/totp/generate-secret");
  return response;
};

export const verifyTotp = async (payload: VerifyTotpRequest) => {
  const response: AxiosResponse<Status<UserLoginResponse>> =
    await instance.post("/api/totp/verify", payload);
  return response;
};

export const enableTotp = async (payload: EnableTotpRequest) => {
  const response: AxiosResponse<Status<EnableTotpResponse>> =
    await instance.post("/api/totp/enable", payload);
  return response;
};

export const disableTotp = async () => {
  const response: AxiosResponse<Status> = await instance.post(
    "/api/totp/disable"
  );
  return response;
};

export const verifyBackupCode = async (payload: UseBackupCodeRequest) => {
  const response: AxiosResponse<Status<UserLoginResponse>> =
    await instance.post("/api/totp/backup", payload);
  return response;
};

// GAME
export const getGames = async () => {
  const response: AxiosResponse<Status<GetGamesResponse>> = await instance.get(
    "/api/games"
  );
  return response;
};

// SWIPE

export const addSwipe = async (payload: AddSwipeRequest) => {
  const response: AxiosResponse<Status<AddSwipeResponse>> = await instance.post(
    "/api/swipes",
    payload
  );
  return response;
};

// CONVERSATION

export const getConversations = async () => {
  const response: AxiosResponse<Status<GetConversationsResponse>> =
    await instance.get("/api/conversations");
  return response;
};

export const deleteConversationById = async (id: string) => {
  const response: AxiosResponse<Status> = await instance.delete(
    `/api/conversations/${id}`
  );
  return response;
};

// MESSAGE
export const getMessagesByConversationId = async (id: string) => {
  const response: AxiosResponse<Status<GetMessagesResponse>> =
    await instance.get(`/api/messages/${id}`);
  return response;
};

export const addMessage = async (payload: AddMessageRequest) => {
  const response: AxiosResponse<Status<AddMessageResponse>> =
    await instance.post("/api/messages", payload);
  return response;
};

export const updateMessagesReadStatus = async (
  payload: UpdateMessagesReadStatusRequest
) => {
  const response: AxiosResponse<Status> = await instance.put(
    "/api/messages/",
    payload
  );
  return response;
};

export const updateSingularMessageReadStatus = async (
  payload: UpdateSingularMessageReadStatusRequest
) => {
  const response: AxiosResponse<Status> = await instance.put(
    "/api/messages/single",
    payload
  );
  return response;
};
