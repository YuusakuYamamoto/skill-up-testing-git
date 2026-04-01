import { Injectable } from "@nestjs/common";
import { CartItem } from "./cart.types";

@Injectable()
export class CartService {
  private items: CartItem[] = [];

  /**
   * カートの全アイテムを取得
   */
  getItems(): CartItem[] {
    return [...this.items];
  }

  /**
   * アイテムをカートに追加
   * - 同じIDのアイテムが既にあれば quantity を加算
   * - なければ新規追加
   */
  addItem(item: CartItem): void {
    const existing = this.items.find((i) => i.id === item.id);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      this.items.push({ ...item });
    }
  }

  /**
   * アイテムをカートから削除
   * - 存在しないIDの場合はエラーをスロー
   */
  removeItem(id: string): void {
    const index = this.items.findIndex((i) => i.id === id);
    if (index === -1) {
      throw new Error(`Item not found: ${id}`);
    }
    this.items.splice(index, 1);
  }

  /**
   * アイテムの数量を更新
   * - 0以下を指定した場合はエラーをスロー
   * - 存在しないIDの場合はエラーをスロー
   */
  updateQuantity(id: string, quantity: number): void {
    if (quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }
    const item = this.items.find((i) => i.id === id);
    if (!item) {
      throw new Error(`Item not found: ${id}`);
    }
    item.quantity = quantity;
  }

  /**
   * カートの合計金額を計算
   */
  getTotal(): number {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  /**
   * カートを空にする
   */
  clear(): void {
    this.items = [];
  }
}
