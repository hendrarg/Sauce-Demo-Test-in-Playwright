---
name: automation-playwright
description: >
  Skill untuk test automation menggunakan Playwright (TypeScript/JavaScript).
  Gunakan skill ini ketika user bekerja di project Playwright — membuat test case,
  Page Object Model, API test, fixtures, intercept network, atau bertanya tentang
  best practices Playwright. Trigger pada: "playwright test", "buat POM playwright",
  "test case playwright", "API test playwright", "intercept request", "fixture playwright",
  "storage state", "selector playwright", "buatkan test", "buat spec".
---

# Playwright Automation Skill

## Core Principles

1. **POM wajib** — locator dan aksi di Page Object, bukan inline di test
2. **Stable selectors** — `data-testid` > `aria/role` > `label` > `id` > CSS > XPath
3. **Explicit waits** — pakai built-in Playwright auto-wait, tidak pernah `page.waitForTimeout()`
4. **Test isolation** — setiap test berdiri sendiri, state tidak bocor antar test
5. **Login via API** — jangan login lewat UI di setiap test, pakai storage state atau fixture
6. **Env config** — `baseURL`, credentials, timeout di `playwright.config.ts` dan `.env`

---

## Project Structure

```
project-root/
├── playwright.config.ts
├── .env.test
├── pages/
│   ├── base.page.ts
│   ├── login.page.ts
│   └── dashboard.page.ts
├── components/           # Reusable UI parts (navbar, modal, table)
│   └── navbar.component.ts
├── fixtures/
│   ├── auth.fixture.ts   # Custom fixtures (extend test)
│   └── users.ts          # Test data
├── requests/             # API request builders
│   ├── base.request.ts
│   └── users.request.ts
├── tests/
│   ├── web/
│   │   └── login.spec.ts
│   └── api/
│       └── users.spec.ts
└── helpers/
    └── auth.helper.ts
```

---

## playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['list']],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: [
    { name: 'setup', testMatch: '**/auth.setup.ts' },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
});
```

---

## Base Page

```typescript
// pages/base.page.ts
import { Page } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  async navigateTo(path: string) {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }
}
```

---

## Page Object

```typescript
// pages/login.page.ts
import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  // Locators — semua di atas sebagai arrow function
  private readonly emailInput    = () => this.page.getByTestId('email-input');
  private readonly passwordInput = () => this.page.getByTestId('password-input');
  private readonly submitButton  = () => this.page.getByRole('button', { name: 'Login' });
  private readonly errorAlert    = () => this.page.getByRole('alert');

  async goto() {
    await this.navigateTo('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput().fill(email);
    await this.passwordInput().fill(password);
    await this.submitButton().click();
  }

  async expectError(message: string) {
    await expect(this.errorAlert()).toContainText(message);
  }
}
```

---

## Auth Fixture (skip UI login)

```typescript
// fixtures/auth.fixture.ts
import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

type Fixtures = {
  loginPage: LoginPage;
  authenticatedPage: Page;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  // Login via API — lebih cepat
  authenticatedPage: async ({ page }, use) => {
    const response = await page.request.post('/api/auth/login', {
      data: {
        email: process.env.TEST_EMAIL,
        password: process.env.TEST_PASSWORD,
      },
    });
    const { token } = await response.json();
    await page.context().addCookies([
      { name: 'auth-token', value: token, domain: 'localhost', path: '/' },
    ]);
    await use(page);
  },
});

export { expect } from '@playwright/test';
```

---

## Auth Setup (Storage State)

```typescript
// tests/setup/auth.setup.ts
import { test as setup } from '@playwright/test';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('email').fill(process.env.TEST_EMAIL!);
  await page.getByTestId('password').fill(process.env.TEST_PASSWORD!);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('/dashboard');
  await page.context().storageState({ path: 'playwright/.auth/user.json' });
});
```

---

## Web Test

```typescript
// tests/web/login.spec.ts
import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('should redirect to dashboard when valid credentials provided', async ({
    loginPage, page,
  }) => {
    await loginPage.login(process.env.TEST_EMAIL!, process.env.TEST_PASSWORD!);
    await expect(page).toHaveURL('/dashboard');
  });

  test('should show error when invalid password provided', async ({ loginPage }) => {
    await loginPage.login(process.env.TEST_EMAIL!, 'wrong-password');
    await loginPage.expectError('Invalid credentials');
  });
});
```

---

## API Test (via request context)

```typescript
// tests/api/users.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Users API', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { email: process.env.TEST_EMAIL, password: process.env.TEST_PASSWORD },
    });
    expect(res.status()).toBe(200);
    token = (await res.json()).token;
  });

  test('should return user list with status 200', async ({ request }) => {
    const res = await request.get('/api/users', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data).toBeInstanceOf(Array);
  });

  test('should create user and return 201', async ({ request }) => {
    const res = await request.post('/api/users', {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        role: 'viewer',
      },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.id).toBeDefined();
  });

  test('should return 404 when user not found', async ({ request }) => {
    const res = await request.get('/api/users/99999', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(404);
  });
});
```

---

## Useful Patterns

### Intercept / Mock Network
```typescript
// Mock response
await page.route('**/api/users', (route) =>
  route.fulfill({ status: 200, json: { data: [{ id: 1, name: 'Mock' }] } })
);

// Spy — tunggu request selesai
const responsePromise = page.waitForResponse('**/api/submit');
await page.getByRole('button', { name: 'Submit' }).click();
const response = await responsePromise;
expect(response.status()).toBe(200);
```

### Soft Assertions
```typescript
await expect.soft(page.getByTestId('title')).toHaveText('Dashboard');
await expect.soft(page.getByTestId('status')).toHaveText('Active');
// Semua dicek, baru fail setelah test selesai
```

### Selector Priority
```typescript
page.getByTestId('submit-btn')              // 1. data-testid — BEST
page.getByRole('button', { name: 'Save' }) // 2. aria role
page.getByLabel('Email address')           // 3. label
page.getByPlaceholder('Enter email')       // 4. placeholder
page.locator('#submit')                    // 5. id — OK
page.locator('.btn-primary')               // 6. CSS — AVOID
page.locator('//div/button[1]')            // 7. XPath — LAST RESORT
```
