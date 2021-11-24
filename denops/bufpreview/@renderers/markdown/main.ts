import { Denops, op, Renderer } from "../../lib/deps.ts";

export default class Markdown extends Renderer {
  constructor(denops: Denops) {
    super(denops);
  }

  get rendererClientHTML() {
    return Deno.readTextFileSync(
      new URL("./main.html", import.meta.url),
    );
  }

  async avaiableRenderer() {
    const ret = (await op.filetype.get(this._denops)) == "markdown";
    return ret;
  }

  data() {
    return {};
  }

  dataFromClient(_) {}
}
