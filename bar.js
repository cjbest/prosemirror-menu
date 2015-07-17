import {defineOption} from "../edit"
import {elt} from "../dom"
import {Debounced} from "../util/debounce"

import {Menu} from "./menu"
import {items as inlineItems} from "./inlinetooltip"
import {items as blockItems} from "./buttonmenu"

import insertCSS from "insert-css"
import "./icons_css"

defineOption("menuBar", false, function(pm, value) {
  if (pm.mod.menuBar)
    pm.mod.menuBar.detach()
  if (value)
    pm.mod.menuBar = new MenuBar(pm, value)
})

const prefix = "ProseMirror-menubar"

class MenuBar {
  constructor(pm, config) {
    this.pm = pm
    this.menuElt = elt("div", {class: prefix + "-inner"})
    this.wrapper = elt("div", {class: prefix},
                       elt("ul", {class: "ProseMirror-menu", style: "visibility: hidden"},
                           elt("li", null, elt("span", {class: "ProseMirror-icon ProseMirror-icon-bold"}))),
                       this.menuElt)
    this.menu = new Menu(pm, this.menuElt, () => this.resetMenu())
    pm.wrapper.insertBefore(this.wrapper, pm.wrapper.firstChild)

    this.debounced = new Debounced(pm, 100, () => this.show())
    pm.on("selectionChange", this.updateFunc = () => this.debounced.trigger())
    pm.on("change", this.updateFunc)

    this.menuItems = config && config.items || inlineItems.getItems().concat(blockItems.getItems())
    this.show()
  }

  detach() {
    this.debounced.clear()
    this.wrapper.parentNode.removeChild(this.wrapper)

    this.pm.off("selectionChange", this.updateFunc)
    this.pm.off("change", this.updateFunc)
  }

  show() { if (!this.menu.depth) this.resetMenu() }
  resetMenu() { this.menu.open(this.menuItems) }
}

insertCSS(`
.ProseMirror-menubar {
  padding: 1px 4px;
  position: relative;
  margin-bottom: 2px;
}

.ProseMirror-menubar-inner {
  padding: 1px 4px;
  top: 0; left: 0; right: 0;
  position: absolute;
  border-bottom: 1px solid silver;
  background: white;
}

.ProseMirror-menubar .ProseMirror-menu-active {
  background: #ddd;
}

.ProseMirror-menubar input[type="text"],
.ProseMirror-menubar textarea {
  background: #eee;
  color: black;
  border: none;
  outline: none;
  margin: 2px;
}

.ProseMirror-menubar input[type="text"] {
  padding: 0 4px;
}

`)
