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

    async getHtml()
    {
        return `
        <canvas id="myCanvas" width="1080" height="720"></canvas>
        `;
    }

    async getJs()
    {
        return "static/transcendence/js/game.js";
    }

    async unLoad()
    {
        UnLoad();
    }
}