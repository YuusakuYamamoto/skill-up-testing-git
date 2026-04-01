import { Controller, Get, Post, Delete, Patch, Body, Param } from "@nestjs/common";
import { CartService } from "./cart.service";
import { CartItem, Discount } from "./cart.types";

@Controller("cart")
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getItems(): CartItem[] {
    return this.cartService.getItems();
  }

  @Get("total")
  getTotal(): { total: number } {
    return { total: this.cartService.getTotal() };
  }

  @Post("items")
  addItem(@Body() item: CartItem): { message: string } {
    this.cartService.addItem(item);
    return { message: "Item added" };
  }

  @Delete("items/:id")
  removeItem(@Param("id") id: string): { message: string } {
    this.cartService.removeItem(id);
    return { message: "Item removed" };
  }

  @Patch("items/:id/quantity")
  updateQuantity(
    @Param("id") id: string,
    @Body("quantity") quantity: number
  ): { message: string } {
    this.cartService.updateQuantity(id, quantity);
    return { message: "Quantity updated" };
  }

  @Post("discount")
  applyDiscount(@Body() discount: Discount): { message: string } {
    this.cartService.applyDiscount(discount);
    return { message: "Discount applied" };
  }

  @Delete()
  clear(): { message: string } {
    this.cartService.clear();
    return { message: "Cart cleared" };
  }
}
