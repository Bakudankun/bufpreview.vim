import { Denops } from "./deps.ts"

type JsonPrimitive =
  | boolean
  | number
  | string
  | null;
type JsonArray = JsonPrimitive[] | JsonObject[];
type JsonObject = {
  [key: string]: JsonPrimitive | JsonObject | JsonArray;
};
type Json = JsonPrimitive | JsonArray | JsonObject;

// 返される可能性のあるautocmd一覧
type Autocmd =
  | "textChenged"
  | "cursorMoved"
  | "bufDelete"

// レンダラー
// denopsが渡される
export abstract class Renderer {
  private _denops

  constructor (denops: Denops) {
    this._denops = denops
  }
  // クライアントのHTML
  abstract get rendererClientHTML(): string;
  // レンダラーを利用できるか
  abstract avaiableRenderer(): boolean;
  // レンダラーに送信するデータ
  abstract data(autocmd: Autocmd): Json;
  // クライアントから送られてきたデータ(現状使用されない)
  abstract dataFromClient(data: Json): void;
  // クライアントの接続が途切れたときに呼ばれる
}
