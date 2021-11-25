import { AutocmdEvent } from "./deps.ts";

type JsonPrimitive =
  | boolean
  | number
  | string
  | null;
type JsonArray = JsonPrimitive[] | JsonObject[];
type JsonObject = {
  [key: string]: JsonPrimitive | JsonObject | JsonArray;
};
export type Json = JsonPrimitive | JsonArray | JsonObject;

/*
 * ライフサイクル
 *
 * Rendererオブジェクトの作成
 *             ↓←-------------
 *    クライアントとの接続   |
 *             ↓------------→|
 *           切断            |
 *             ↓--------------
 *           破棄
 */

/*
onCreate
onConnection
onDisconnect
onDestroy
*/

/*
 * Class: Renderer
 *   バッファのレンダリングに使用されるクラスです。
 *   [runtimepath/pluginname]/bufpreview/@renderers/[rendererName]/main.ts
 *   でdefault exportしてください。
 * Params:
 *   コンストラクターに渡す引数
 *   denops: Denops
 *     denopsインスタンスが渡されます
 *   options: Json
 *     レンダラーのオプションが渡されます
 *     ```vim
 *     g:bufpreview.renderer.[rendererName] = {
 *       \"option": "value"
 *       \}
 *     ```
 */
export abstract class Renderer {
  /*
   * function: rendererClientHTML() => string
   *   クライアントのHTMLファイルを渡してください
   *   現状一種類のファイルのみ返すことができます
   */
  abstract get rendererClientHTML(): string;

  /*
   * function: isRendererAvaiable() => boolean
   *   レンダラーを利用できるかを返してください
   *   (filetypeのチェックなど)
   */
  abstract isRendererAvaiable(): boolean;

  // TODO: データを送れる関数を生やす
  // Rendererインスタンス作成時
  abstract onCreate(): void
  // 新規接続確立時 => クライアントに送信するデータ
  abstract onConnection(): Json;
  // 接続切断時
  abstract onDisconnect(): void;
  // インスタンス破棄時
  abstract onDestroy(): void;

  /*
   * function: dataToClient(autocmd: AutocmdEvent): Json
   *   Vimからのイベントでクライアントに送るデータを返してください
   *   引数としてAutocmdEventが渡されます。これはデータ送信の理由を表しており、
   *   必要なデータをAutocmdの種類に応じて出しわけることができます
   */
  abstract dataToClient(autocmd: AutocmdEvent): Json;

  /*
   * function: dataFromClient(data: Json)
   *   クライアントからデータが送られてきた時に呼ばれる
   */
  abstract dataFromClient(data: Json): void;
  // TODO: クライアントの接続が途切れたときに呼ばれる
}
