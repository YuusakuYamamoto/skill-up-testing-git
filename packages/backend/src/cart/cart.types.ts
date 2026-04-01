export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Discount {
  type: "percent" | "fixed";
  value: number;           // percent: 0-100, fixed: 金額
  minTotal?: number;       // この金額以上で適用（省略時は常に適用）
}
