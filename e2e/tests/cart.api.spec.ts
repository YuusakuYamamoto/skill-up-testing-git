import { test, expect } from "@playwright/test";

test.describe("Cart API", () => {
  // 各テストの前にカートをクリア
  test.beforeEach(async ({ request }) => {
    await request.delete("/cart");
  });

  test("空のカートを取得できる", async ({ request }) => {
    const response = await request.get("/cart");

    expect(response.ok()).toBe(true);
    expect(await response.json()).toEqual([]);
  });

  test("アイテムを追加して取得できる", async ({ request }) => {
    // アイテム追加
    const addResponse = await request.post("/cart/items", {
      data: {
        id: "apple-1",
        name: "りんご",
        price: 150,
        quantity: 3,
      },
    });
    expect(addResponse.ok()).toBe(true);

    // カート取得
    const getResponse = await request.get("/cart");
    const items = await getResponse.json();

    expect(items).toHaveLength(1);
    expect(items[0].name).toBe("りんご");
    expect(items[0].quantity).toBe(3);
  });

  test("合計金額を取得できる", async ({ request }) => {
    await request.post("/cart/items", {
      data: { id: "apple-1", name: "りんご", price: 150, quantity: 2 },
    });
    await request.post("/cart/items", {
      data: { id: "banana-1", name: "バナナ", price: 100, quantity: 3 },
    });

    const response = await request.get("/cart/total");
    const { total } = await response.json();

    expect(total).toBe(600); // 150*2 + 100*3
  });

  test("アイテムを削除できる", async ({ request }) => {
    await request.post("/cart/items", {
      data: { id: "apple-1", name: "りんご", price: 150, quantity: 1 },
    });

    const deleteResponse = await request.delete("/cart/items/apple-1");
    expect(deleteResponse.ok()).toBe(true);

    const getResponse = await request.get("/cart");
    expect(await getResponse.json()).toEqual([]);
  });

  test("数量を更新できる", async ({ request }) => {
    await request.post("/cart/items", {
      data: { id: "apple-1", name: "りんご", price: 150, quantity: 1 },
    });

    await request.patch("/cart/items/apple-1/quantity", {
      data: { quantity: 5 },
    });

    const response = await request.get("/cart");
    const items = await response.json();
    expect(items[0].quantity).toBe(5);
  });

  test("割引を適用して合計が計算される", async ({ request }) => {
    await request.post("/cart/items", {
      data: { id: "apple-1", name: "りんご", price: 1000, quantity: 1 },
    });

    await request.post("/cart/discount", {
      data: { type: "percent", value: 10 },
    });

    const response = await request.get("/cart/total");
    const { total } = await response.json();
    expect(total).toBe(900);
  });

  test("複数操作の一連のフローが正しく動作する", async ({ request }) => {
    // 1. アイテムを2つ追加
    await request.post("/cart/items", {
      data: { id: "a", name: "商品A", price: 500, quantity: 2 },
    });
    await request.post("/cart/items", {
      data: { id: "b", name: "商品B", price: 300, quantity: 1 },
    });

    // 2. 合計確認: 500*2 + 300 = 1300
    let res = await request.get("/cart/total");
    expect((await res.json()).total).toBe(1300);

    // 3. 商品Aの数量を変更
    await request.patch("/cart/items/a/quantity", {
      data: { quantity: 1 },
    });

    // 4. 合計確認: 500*1 + 300 = 800
    res = await request.get("/cart/total");
    expect((await res.json()).total).toBe(800);

    // 5. 10%割引適用
    await request.post("/cart/discount", {
      data: { type: "percent", value: 10 },
    });

    // 6. 合計確認: 800 * 0.9 = 720
    res = await request.get("/cart/total");
    expect((await res.json()).total).toBe(720);

    // 7. 商品Bを削除
    await request.delete("/cart/items/b");

    // 8. 合計確認: 500 * 0.9 = 450
    res = await request.get("/cart/total");
    expect((await res.json()).total).toBe(450);
  });
});
