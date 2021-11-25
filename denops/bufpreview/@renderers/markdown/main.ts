import { Denops, op, Renderer, Json } from "../../lib/deps.ts";

export default class Markdown extends Renderer {
  private _denops: Denops
  private _options: {
    renderer: string,
    plantUmlUrl: string
  } = {
    renderer: "markdown-it",
    plantUmlUrl: ""
  }

  constructor(denops: Denops, options: Json) {
    super()
    this._denops = denops
    if (typeof options.renderer == "string") {
      this._options.renderer = options.renderer
    }
    if (typeof options.plantUmlUrl == "string") {
      this._options.plantUmlUrl = options.plantUmlUrl
    }
  }

  get rendererClientHTML() {
    return Deno.readTextFileSync(
      new URL("./main.html", import.meta.url),
    );
  }

  async isRendererAvaiable() {
    const ret = (await op.filetype.get(this._denops)) == "markdown";
    return ret;
  }

  onCreate() {}

  onConnection() {
    return {
      options: this._options
    }
  }

  onDisconnect() {}

  onDestroy() {}

  dataToClient() {
    return {};
  }

  dataFromClient(_) {}
}

