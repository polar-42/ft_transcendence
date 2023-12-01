import AbstractView from "./AbstractView.js";

export default class extends AbstractView
{
    constructor()
    {
        super();
        this.setTitle("Loggin");
    }

    async Load()
    {
    }

    async getHtml(url)
    {
        return `
        <h1>You need to  be logged to access this page</h1>
        <form method="post" action="{% url 'login' %}">
        {% csrf_token %}
        <table>
          <tr>
            <td>{{ form.username.label_tag }}</td>
            <td>{{ form.username }}</td>
          </tr>
          <tr>
            <td>{{ form.password.label_tag }}</td>
            <td>{{ form.password }}</td>
          </tr>
        </table>
        <input type="submit" value="login">
        <input type="hidden" name="next" value="{{ next }}">
      </form>
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