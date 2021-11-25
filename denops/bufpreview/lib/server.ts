import { Denops, Renderer, v4 } from "./deps.ts";

import Buffer from "./buffer.ts";

// TODO: レンダラーが使えるかのチェックをする

export default class Server {
  private _denops: Denops;
  private _bufnr: number;
  private _onClose: () => void;
  private _renderer: Renderer;

  private _buffer: Buffer;
  private _listener: Deno.Listener | undefined;
  private _body: string;

  private _sockets: Map<string, globalThis.WebSocket> = new Map<
    string,
    globalThis.WebSocket
  >();

  // 初期化処理
  constructor(
    denops: Denops,
    bufnr: number,
    // サーバ側で通信が切断された時に呼ばれます
    onClose: () => void,
    // レンダラー
    renderer: Renderer,
  ) {
    this._denops = denops;
    this._bufnr = bufnr;
    this._onClose = onClose;
    this._renderer = renderer;

    this._buffer = new Buffer(denops, this._bufnr);

    // 更新
    this._buffer.events.on("TextChanged", (buffer) => {
      const data = {
        buf: buffer.lines,
      };

      this._sockets.forEach((socket) => {
        socket.send(JSON.stringify(data));
      });
    });

    this._buffer.events.on("CursorMoved", (buffer) => {
      const data = {
        cursorLine: {
          linePos: buffer.cursorline,
          bufLengh: buffer.lines.length,
          data: this._renderer.dataToClient("CursorMoved"),
        },
      };
      this._sockets.forEach((socket) => {
        socket.send(JSON.stringify(data));
      });
    });

    // バッファが削除された時
    this._buffer.events.on("BufDelete", (_) => {
      const data = {
        data: this._renderer.dataToClient("BufDelete"),
      };
      this._sockets.forEach((socket) => {
        socket.send(JSON.stringify(data));
      });
      this.close();
    });

    // クライアント
    this._body = this._renderer.rendererClientHTML;
  }

  run(host: string, port: number) {
    this._listener = Deno.listen({
      hostname: host,
      port: port,
    });
    this._serve(this._listener);
  }

  private async _serve(listenner: Deno.Listener) {
    const handleHttp = async (conn: Deno.Conn) => {
      for await (const e of Deno.serveHttp(conn)) {
        const { request, respondWith } = e;
        // クライアントの送信
        if (request.method === "GET" && new URL(request.url).pathname === "/") {
          respondWith(
            new Response(this._body, {
              status: 200,
              headers: new Headers({
                "content-type": "text/html",
              }),
            }),
          );
        } else if (
          request.method === "GET" && new URL(request.url).pathname === "/ws"
        ) {
          respondWith(this._wsHandle(request));
        }
      }
    };
    for await (const conn of listenner) {
      handleHttp(conn);
    }
  }

  // サーバとの通信
  private _wsHandle(request: Request): Response {
    const { socket, response } = Deno.upgradeWebSocket(request);
    const uid = v4.generate();

    this._sockets.set(uid, socket);
    socket.onopen = () => {
      // 初回接続時にバッファを送信する
      this._buffer.events.emit("TextChanged", this._buffer);
      this._buffer.events.emit("CursorMoved", this._buffer);
      // 接続を確立したソケットのみに送信
      socket.send(JSON.stringify({
        bufname: this._buffer.bufname,
        // レンダラー依存のデータ
        data: this._renderer.onConnection()
      }));
    };
    // ブラウザ側から通信が切断された時
    socket.onclose = () => {
      this._sockets.delete(uid);
    };
    socket.onmessage = (_) => {};
    return response;
  }

  // 終了処理
  close() {
    this._buffer.close();
    if (this._listener != undefined) {
      this._listener.close();
      this._listener = undefined;
    }
    this._sockets.forEach((socket) => {
      if (socket.readyState !== socket.CLOSED) {
        socket.send(JSON.stringify({ connect: "close" }));
      }
      socket.close();
    });
    this._onClose();
  }

  get host(): string {
    // @ts-ignore: type is not exposed
    return this._listener.addr.hostname as string;
  }

  get port(): number {
    if (this._listener == undefined) {
      return -1;
    }
    // @ts-ignore: type is not exposed
    return this._listener.addr.port as number;
  }
}
