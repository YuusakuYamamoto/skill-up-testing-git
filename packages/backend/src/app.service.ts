import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello(): string {
    return "Hello World!";
  }

  /**
   * 2つの数値を加算する（TDD練習用に後で拡張）
   */
  add(a: number, b: number): number {
    return a + b;
  }
}
