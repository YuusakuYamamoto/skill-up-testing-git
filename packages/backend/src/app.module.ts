import { Module } from "@nestjs/common";
import { AppService } from "./app.service";
import { CartService } from "./cart/cart.service";
import { CartController } from "./cart/cart.controller";

@Module({
  controllers: [CartController],
  providers: [AppService, CartService],
})
export class AppModule {}
