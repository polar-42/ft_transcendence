import AbstractView from "./AbstractView.js";
import { UnLoad } from "../game.js";
import { initGame } from "../game.js";

export default class extends AbstractView
{
    constructor()
    {
        super();
        this.setTitle("Battleship");
    }

    async Load()
    {
        initGame();
    }

    async getHtml(url)
    {
        const response = await fetch(url);
        const html = await response.text();
        return html
    }

    async getJs()
    {
        return "static/js/game.js";
    }

    async unLoad()
    {
        UnLoad();
    }
}