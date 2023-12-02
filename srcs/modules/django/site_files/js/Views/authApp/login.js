import AbstractView from "../AbstractView.js";

export default class extends AbstractView
{
    constructor()
    {
        super();
        this.setTitle("login");
    }

    async Load()
    {
        
    }

    async getHtml(url)
    {
        const response = await fetch(url + "/?valid=True");
        const html = await response.text();
        return html
    }

    async getJs()
    {
        return "";
    }

    async unLoad()
    {
    }
}