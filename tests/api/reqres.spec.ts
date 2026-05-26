import { test, expect } from '@playwright/test';
import { ReqresClient } from './client/reqres.client';
import { loginPayload, updateUserPayload } from './fixtures/payloads';

test.describe('Reqres API', () => {
  let client: ReqresClient;

  test.beforeEach(({ request }) => {
    client = new ReqresClient(request);
  });

  test.describe('Auth', () => {
    test('POST /login - should return a token on valid credentials', async () => {
      const { response, body } = await client.login(loginPayload);

      expect(response.status()).toBe(200);
      expect(body).toHaveProperty('token');
      expect(typeof body.token).toBe('string');
      expect(body.token.length).toBeGreaterThan(0);
    });
  });

  test.describe('Users', () => {
    test('GET /user - should return a list of users', async () => {
      const { response, body } = await client.listUsers();

      expect(response.status()).toBe(200);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
      expect(body).toMatchObject({
        page: expect.any(Number),
        per_page: expect.any(Number),
        total: expect.any(Number),
        total_pages: expect.any(Number),
      });
    });

    test('GET /users/:id - should return a single user', async () => {
      const { response, body } = await client.getSingleUser(2);

      expect(response.status()).toBe(200);
      expect(body.data).toMatchObject({
        id: 2,
        email: expect.any(String),
        first_name: expect.any(String),
        last_name: expect.any(String),
        avatar: expect.any(String),
      });
    });

    test('PUT /users/:id - should update a user and return updatedAt', async () => {
      const { response, body } = await client.updateUser(2, updateUserPayload);

      expect(response.status()).toBe(200);
      expect(body.name).toBe(updateUserPayload.name);
      expect(body.job).toBe(updateUserPayload.job);
      expect(body).toHaveProperty('updatedAt');
      expect(typeof body.updatedAt).toBe('string');
    });

    test('DELETE /users/:id - should return 204 No Content', async () => {
      const response = await client.deleteUser(2);

      expect(response.status()).toBe(204);
    });
  });

  test.describe('Resources', () => {
    test('GET /unknown - should return a list of resources', async () => {
      const { response, body } = await client.listResources();

      expect(response.status()).toBe(200);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
    });

    test('GET /products?page=1 - should return paginated products', async () => {
      const { response, body } = await client.listProducts(1);

      expect(response.status()).toBe(200);
      expect(body).toHaveProperty('page', 1);
      expect(Array.isArray(body.data)).toBe(true);
    });
  });
});
