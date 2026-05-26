export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
}

export interface Resource {
  id: number;
  name: string;
  year: number;
  color: string;
  pantone_value: string;
}

export interface Support {
  url: string;
  text: string;
}

export interface PaginatedResponse<T> {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: T[];
  support: Support;
}

export interface SingleResponse<T> {
  data: T;
  support: Support;
}

export interface UpdateUserRequest {
  name: string;
  job: string;
}

export interface UpdateUserResponse {
  name: string;
  job: string;
  updatedAt: string;
}

export type ListUsersResponse = PaginatedResponse<User>;
export type SingleUserResponse = SingleResponse<User>;
export type ListResourcesResponse = PaginatedResponse<Resource>;
