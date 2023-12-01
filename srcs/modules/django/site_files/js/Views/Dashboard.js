import AbstractView from "./AbstractView.js";

export default class extends AbstractView
{
    constructor()
    {
        super();
        this.setTitle("DashBoard");
    }

    async getHtml(url)
    {
        const response = await fetch(url + "dashboard" + "/?valid=True");
        const html = await response.text();
        return html
    }

    async getJs()
    {
        return "";
    }

    async unLoad()
    {
        return "";
    }

    async Load()
    {

    }
}