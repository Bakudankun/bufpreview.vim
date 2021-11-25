import {
  Denops,
  ensureString,
  fn,
  op,
  open,
  Renderer,
  vars,
  basename,
  join
} from "./lib/deps.ts";

import Server from "./lib/server.ts";

// 一度に開けるサーバーは一つ
let server: Server | undefined;

// レンダラー
interface Renderers {
  [key: string]: Renderer;
}
let renderers: Renderers

export async function main(denops: Denops) {
  // 全てのレンダラーを探索
  async function findRenderer(): Promise<Renderers> {
    const runtimepath = (await op.runtimepath.getGlobal(denops)).split(",");
    const paths: string[] = []
    const ret: Renderers = {}
    // さがす
    for (const path of runtimepath) {
      const i = await fn.globpath(denops, path, "denops/bufpreview/@renderers/*", true, true) as string[]
      paths.push(...i)
    }
    // よみこむ
    // TODO: ここ非同期で読み込む
    for (const path of paths) {
      const name = basename(path)
      const codePath = join(path, "main.ts")
      ret[name] = (await import(codePath)).default
    }
    return ret
  }
  renderers = await findRenderer()

  denops.dispatcher = {
    // Vimから呼ばれる
    async md(arg: unknown): Promise<void> {
      ensureString(arg);

      // オプションを設定
      const browser =
        (await vars.g.get(denops, "bufpreview_browser") || undefined) as
          | string
          | undefined;
      const opener: { app?: string } = { app: browser };
      const openBrowserFn =
        (await vars.g.get(denops, "bufpreview_open_browser_fn") ||
          "") as string;
      const host = (await vars.b.get(denops, "bufpreview_server_host") ||
        await vars.g.get(denops, "bufpreview_server_host") ||
        "127.0.0.1") as string;
      const port = (await vars.b.get(denops, "bufpreview_server_port") ||
        await vars.g.get(denops, "bufpreview_server_port") || 0) as number;

      // サーバーを開く
      const openServer = async () => {
        // @ts-ignore: これ型エラーにならない方法知っている方教えて
        const renderer = new renderers["markdown"](denops, { plantUMLPort: "localhost" })
        // サーバーが既に開かれているなら
        if (server != undefined) {
          server.close();
        }
        server = new Server(
          denops,
          await denops.call("bufnr") as number,
          () => {
            server = undefined;
          },
          renderer,
        );
        server.run(host, port);
        const link = `http://${server.host}:${server.port}`;
        if (openBrowserFn != "") {
          await fn.call(denops, openBrowserFn, [link]);
        } else {
          open(link, opener).catch((_) => {
            console.log(`Server started on ${link}`);
          });
        }
      };

      // サーバーを閉じる
      const closeServer = () => {
        if (server != undefined) {
          server.close();
          server = undefined;
        }
      };

      if (arg === "open") {
        if (await op.filetype.get(denops) == "markdown") {
          openServer();
        } else {
          console.error("not a markdown file");
        }
      } else if (arg === "close") {
        closeServer();
      } else if (arg === "toggle") {
        // if server is already started
        if (server != undefined) {
          closeServer();
        } else {
          if (await op.filetype.get(denops) == "markdown") {
            openServer();
          }
        }
      }
    },
  };
}
