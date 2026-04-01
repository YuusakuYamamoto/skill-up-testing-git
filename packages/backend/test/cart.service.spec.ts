import { describe, it, expect, beforeEach } from "vitest";
import { CartService } from "../src/cart/cart.service";
import { CartItem } from "../src/cart/cart.types";

describe("CartService", () => {
  let service: CartService;

  // テストごとにサービスを初期化（テスト間の依存を排除）
  beforeEach(() => {
    service = new CartService();
  });

  // テストで繰り返し使うデータをヘルパーとして定義
  const createItem = (overrides?: Partial<CartItem>): CartItem => ({
    id: "item-1",
    name: "りんご",
    price: 100,
    quantity: 1,
    ...overrides,
  });

  // ─── getItems ───────────────────────────────

  describe("getItems", () => {
    it("カートが空のとき、空配列を返す", () => {
      expect(service.getItems()).toEqual([]);
    });

    it("追加したアイテムが含まれる", () => {
      const item = createItem();
      service.addItem(item);

      const items = service.getItems();
      expect(items).toHaveLength(1);
      expect(items[0]).toEqual(item);
    });

    it("返り値を変更してもカート内部に影響しない（防御的コピー）", () => {
      service.addItem(createItem());

      const items = service.getItems();
      items.pop(); // 返り値から削除

      expect(service.getItems()).toHaveLength(1); // カートは影響を受けない
    });
  });

  // ─── addItem ────────────────────────────────

  describe("addItem", () => {
    it("新規アイテムを追加できる", () => {
      service.addItem(createItem());
      expect(service.getItems()).toHaveLength(1);
    });

    it("同じIDのアイテムは quantity が加算される", () => {
      service.addItem(createItem({ quantity: 2 }));
      service.addItem(createItem({ quantity: 3 }));

      const items = service.getItems();
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(5);
    });

    it("異なるIDのアイテムはそれぞれ追加される", () => {
      service.addItem(createItem({ id: "item-1" }));
      service.addItem(createItem({ id: "item-2", name: "みかん" }));

      expect(service.getItems()).toHaveLength(2);
    });
  });

  // ─── removeItem ─────────────────────────────

  describe("removeItem", () => {
    it("存在するアイテムを削除できる", () => {
      service.addItem(createItem());
      service.removeItem("item-1");

      expect(service.getItems()).toHaveLength(0);
    });

    it("存在しないIDで Error をスローする", () => {
      expect(() => service.removeItem("nonexistent")).toThrow("Item not found");
    });
  });

  // ─── updateQuantity ─────────────────────────

  describe("updateQuantity", () => {
    it("数量を更新できる", () => {
      service.addItem(createItem({ quantity: 1 }));
      service.updateQuantity("item-1", 5);

      expect(service.getItems()[0].quantity).toBe(5);
    });

    it("0以下の数量で Error をスローする", () => {
      service.addItem(createItem());
      expect(() => service.updateQuantity("item-1", 0)).toThrow(
        "Quantity must be greater than 0"
      );
    });

    it("負の数量で Error をスローする", () => {
      service.addItem(createItem());
      expect(() => service.updateQuantity("item-1", -1)).toThrow(
        "Quantity must be greater than 0"
      );
    });

    it("存在しないIDで Error をスローする", () => {
      expect(() => service.updateQuantity("nonexistent", 1)).toThrow(
        "Item not found"
      );
    });
  });

  // ─── getTotal ───────────────────────────────

  describe("getTotal", () => {
    it("カートが空のとき 0 を返す", () => {
      expect(service.getTotal()).toBe(0);
    });

    it("単一アイテムの合計を正しく計算する", () => {
      service.addItem(createItem({ price: 100, quantity: 3 }));
      expect(service.getTotal()).toBe(300);
    });

    it("複数アイテムの合計を正しく計算する", () => {
      service.addItem(createItem({ id: "1", price: 100, quantity: 2 })); // 200
      service.addItem(createItem({ id: "2", price: 250, quantity: 1 })); // 250

      expect(service.getTotal()).toBe(450);
    });
  });

  // ─── clear ──────────────────────────────────

  describe("clear", () => {
    it("カートが空になる", () => {
      service.addItem(createItem());
      service.addItem(createItem({ id: "item-2" }));

      service.clear();

      expect(service.getItems()).toEqual([]);
      expect(service.getTotal()).toBe(0);
    });
  });
});
