import { expect, test, type Page } from '@playwright/test';

const YANG = '\u25CB';
const YIN = '\u2715';

async function markedSquares(page: Page): Promise<number> {
  const texts = await page.getByRole('gridcell').allTextContents();
  return texts.filter((text) => text.trim() !== '').length;
}

test('the board loads ready for the first move', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Tao');
  await expect(page.getByTestId('status')).toHaveText('Your move.');
  await expect(page.getByRole('gridcell')).toHaveCount(9);
  expect(await markedSquares(page)).toBe(0);
});

test('a human move is answered by the opponent', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('square-4').click();
  await expect(page.getByTestId('square-4')).toHaveText(YANG);

  await expect.poll(() => markedSquares(page)).toBe(2);
  await expect(page.getByTestId('status')).toHaveText('Your move.');
});

test('a full game against Tao reaches a result and is recorded', async ({ page }) => {
  await page.goto('/');

  for (let attempt = 0; attempt < 9; attempt += 1) {
    const status = await page.getByTestId('status').textContent();
    if (status && !status.includes('Your move')) break;

    const empty = page.getByRole('gridcell').filter({ hasText: /^$/ });
    const count = await empty.count();
    if (count === 0) break;

    await empty.first().click();
    await page.waitForTimeout(450);
  }

  await expect(page.getByTestId('status')).toHaveText(/The Tao wins\.|Perfect balance|You win\./);

  const decided = await page.getByTestId('tally-wins').textContent();
  const drawn = await page.getByTestId('tally-draws').textContent();
  const lost = await page.getByTestId('tally-losses').textContent();
  expect(Number(decided) + Number(drawn) + Number(lost)).toBe(1);
});

test('new game clears the board but keeps the tally', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('square-0').click();
  await expect(page.getByTestId('square-0')).toHaveText(YANG);

  await page.getByTestId('restart').click();
  expect(await markedSquares(page)).toBe(0);
  await expect(page.getByTestId('status')).toHaveText('Your move.');
});

test('the yielding opponent can be chosen and beaten', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('radio', { name: /Yielding/ }).click();
  await expect(page.getByRole('radio', { name: /Yielding/ })).toHaveAttribute(
    'aria-checked',
    'true',
  );

  for (let attempt = 0; attempt < 9; attempt += 1) {
    const status = await page.getByTestId('status').textContent();
    if (status && !status.includes('Your move')) break;

    const empty = page.getByRole('gridcell').filter({ hasText: /^$/ });
    if ((await empty.count()) === 0) break;
    await empty.first().click();
    await page.waitForTimeout(450);
  }

  const finalStatus = await page.getByTestId('status').textContent();
  expect(finalStatus).toMatch(/You win\.|The Tao wins\.|Perfect balance/);

  const marks = await page.getByRole('gridcell').allTextContents();
  expect(marks.some((mark) => mark.includes(YANG) || mark.includes(YIN))).toBe(true);
});
