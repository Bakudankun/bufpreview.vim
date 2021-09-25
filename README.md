# ✨ Markdown preview for Vim and Neovim ✨

> ⚠️ This Plugin is currently under development ⚠️  
> Powered by 🐜[denops.vim](https://github.com/vim-denops/denops.vim)🐜

## introduction
Preview markdown on your browser.

Main features:
- Supports Vim and Neovim
- Fast asynchronus updates
- Syntax highlight
- Simple Dependency and easy to install

## install & usage
### requirements
- [denops.vim](https://github.com/vim-denops/denops.vim)
- [Deno](https://deno.land)
- [Chrome](https://www.google.co.jp/chrome/)/[Safari](https://www.apple.com/jp/safari/)/[Firefox](https://www.mozilla.org/ja/firefox/new/)

Install with [vim-plug](https://github.com/junegunn/vim-plug):
```vim
Plug 'vim-denops/denops.vim'
Plug 'kat0h/dps-mdpreview'
```

Or install with [dein.vim](https://github.com/Shougo/dein.vim):
```vim
call dein#add('kat0h/dps-mdpreview')
```

Or install with [minpac](https://github.com/k-takata/minpac):
```vim
call minpac#add('kat0h/dps-mdpreview')
```

Or install with [Vundle](https://github.com/VundleVim/Vundle.vim):
```vim
Plugin 'kat0h/dps-mdpreview'
```

Commands:
```
" Start the preview
:PreviewMarkdown
" Stop the preview
:PreviewMarkdownStop
" Toggle the window
:PreviewMarkdownToggle
```
