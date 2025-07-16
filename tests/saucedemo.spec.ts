import { test, expect } from "@playwright/test";

const URL = 'https://www.saucedemo.com/v1/'

const users = {
    standard : 'standard_user',
    locked : 'locked_out_user',
    problem : 'problem_user'
}

const password = 'secret_sauce'

test.describe('SauceDemo Conditional Login',() => {
test.beforeEach(async ({page}) =>{
await page.goto(URL)

await page.locator('#user-name').fill(users.locked)
await page.locator('#password').fill(password)
await page.locator('#login-button').click()

const errorMessageLocator = page.locator('.error-button')

if (await errorMessageLocator.isVisible()){

await page.locator('#user-name').fill(users.standard)
await page.locator('#password').fill(password)
await page.locator('#login-button').click()

await expect(page).toHaveURL(/inventory/)
console.log('Login berhasil dengan standard_user')

}else{
console.log('Login berhasil dengan locked_out_user')
}
})

test('Validasi Produk', async ({page}) =>{

    const products = await page.locator('.inventory_item')
    const productCount = await products.count()

    console.log('Jumblah Produk :' + productCount)
    expect(productCount).toBe(6)

    let label = (await page.locator('.inventory_item_name').filter({hasText: 'Sauce Labs Backpack'}).textContent())?.trim()
    let price = (await page.locator('.inventory_item_price').filter({hasText: '$29.99'}).textContent())?.trim()
    console.log('Label: ', label)
    console.log('Price: ', price)

    await page.locator('.inventory_item').filter({hasText: label}).getByRole('button').click()
    expect(await page.getByText('REMOVE'))
    await page.locator('#shopping_cart_container').click()

    await expect(page).toHaveURL(/cart/)
    console.log('Page Cart')

    await expect(label).toBe('Sauce Labs Backpack')
    await expect(price).toBe('$29.99')
})
}) 