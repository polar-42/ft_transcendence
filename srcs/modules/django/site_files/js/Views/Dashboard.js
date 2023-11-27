import AbstractView from "./AbstractView.js";

export default class extends AbstractView
{
    constructor()
    {
        super();
        this.setTitle("DashBoard");
    }

    async getHtml()
    {
        return `
            <h1> Welcome Back, Dom</h1>
            <p>
                Maecenas tortor sapien, tristique sit amet nunc at, dignissim iaculis mi. Aliquam consequat orci id dui tincidunt, ut gravida lacus sodales. Nunc nisi augue, pellentesque eu sollicitudin in, pulvinar vitae urna. In lobortis aliquam condimentum. Maecenas efficitur sit amet turpis et porttitor. Nam ut scelerisque nunc, sed auctor mauris. Pellentesque ultricies efficitur arcu, ut mollis purus consequat nec.
            </p>
            <p>
                <a href="/postslist" data-link> View recent posts</a>
            </p>
            

        `;
    }
}