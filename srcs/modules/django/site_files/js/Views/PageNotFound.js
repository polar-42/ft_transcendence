import AbstractView from "./AbstractView.js";

export default class extends AbstractView
{
    constructor()
    {
        super();
        this.setTitle("404");
    }

    async Load()
    {
        
    }

    async getHtml(url)
    {
        return `
        <img src="static/assets/logo/tmp_404.jpg"></img>
        `;
    }

    async getJs()
    {
        return "";
    }

    async unLoad()
    {
    }
}