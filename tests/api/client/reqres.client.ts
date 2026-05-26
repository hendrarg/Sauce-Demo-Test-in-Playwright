import { APIRequestContext, APIResponse } from '@playwright/test';
import {
  LoginRequest,
  LoginResponse,
  ListUsersResponse,
  SingleUserResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  ListResourcesResponse,
} from '../types/reqres.types';

const BASE_URL = 'https://reqres.in';
const API_KEY = 'free_user_3CO4gRX8WiMsAeqp1WcQiafcVON';

export class ReqresClient {
  private readonly request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  private get defaultHeaders() {
    return { 'x-api-key': API_KEY };
  }

  private get jsonHeaders() {
    return { ...this.defaultHeaders, 'Content-Type': 'application/json' };
  }

  async login(payload: LoginRequest): Promise<{ response: APIResponse; body: LoginResponse }> {
    const response = await this.request.post(`${BASE_URL}/api/login`, {
      headers: this.jsonHeaders,
      data: payload,
    });
    const body = (await response.json()) as LoginResponse;
    return { response, body };
  }

  async listUsers(page?: number): Promise<{ response: APIResponse; body: ListUsersResponse }> {
    const response = await this.request.get(`${BASE_URL}/api/user`, {
      headers: this.defaultHeaders,
      params: page ? { page: String(page) } : undefined,
    });
    const body = (await response.json()) as ListUsersResponse;
    return { response, body };
  }

  async getSingleUser(id: number): Promise<{ response: APIResponse; body: SingleUserResponse }> {
    const response = await this.request.get(`${BASE_URL}/api/users/${id}`, {
      headers: this.defaultHeaders,
    });
    const body = (await response.json()) as SingleUserResponse;
    return { response, body };
  }

  async updateUser(
    id: number,
    payload: UpdateUserRequest
  ): Promise<{ response: APIResponse; body: UpdateUserResponse }> {
    const response = await this.request.put(`${BASE_URL}/api/users/${id}`, {
      headers: this.jsonHeaders,
      data: payload,
    });
    const body = (await response.json()) as UpdateUserResponse;
    return { response, body };
  }

  async deleteUser(id: number): Promise<APIResponse> {
    return this.request.delete(`${BASE_URL}/api/users/${id}`, {
      headers: this.defaultHeaders,
    });
  }

  async listResources(): Promise<{ response: APIResponse; body: ListResourcesResponse }> {
    const response = await this.request.get(`${BASE_URL}/api/unknown`, {
      headers: this.defaultHeaders,
    });
    const body = (await response.json()) as ListResourcesResponse;
    return { response, body };
  }

  async listProducts(page = 1): Promise<{ response: APIResponse; body: ListResourcesResponse }> {
    const response = await this.request.get(`${BASE_URL}/api/products`, {
      headers: this.defaultHeaders,
      params: { page: String(page) },
    });
    const body = (await response.json()) as ListResourcesResponse;
    return { response, body };
  }
}
