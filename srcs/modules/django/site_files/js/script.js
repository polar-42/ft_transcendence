//function fetchData() {
//        fetch('/transcendence/get_data/')
//                .then(response => response.json())
//                .then(data => {
//                        console.log(data);
//                        var sucessElement = document.getElementById('sucess-message');
//                        sucessElement.textContent = data.message;
//                })
//                .catch(error => console.error('Error:', error));
//}

//function testFunction()
//{
//        fetch('/transcendence/create_object/');
//        console.log('test');
//}

//testFunction();

function checkConnexion() {
        var crsf_token = document.getElementsByName('csrfmiddlewaretoken')[0].value;

        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('X-CSRFToken', crsf_token);

        fetch('/transcendence/check_connexion/')
                .then(response => response.json())
                .then(data => {
                        console.log(data.message);
                        document.getElementById('checkConnexionText').innerHTML = data.message;
                })
                .catch(error => {
                        console.error('Error:', error);
                });
}

function checkDisconnexion() {
        var crsf_token = document.getElementsByName('csrfmiddlewaretoken')[0].value;

        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('X-CSRFToken', crsf_token);

        fetch('/transcendence/check_disconnexion/')
                .then(response => response.json())
                .then(data => {
                        console.log(data.message);
                        document.getElementById('checkDisconnexionText').innerHTML = data.message;
                })
                .catch(error => {
                        console.error('Error:', error);
                });
}

function connexionButton() {
        //Forbidden (CSRF token from the 'X-Csrftoken' HTTP header incorrect.): /transcendence/connect_user/
        //ERROR
        var username = document.getElementById('usernameConnexion').value;
        var password = document.getElementById('passwordConnexion').value;

        var data = {
                username: username,
                password: password
        };

        var crsf_token = document.getElementsByName('csrfmiddlewaretoken')[0].value;

        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('X-CSRFToken', crsf_token);

        fetch('/transcendence/connect_user/', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data),
        })
        .then(response => {
                if (!response.ok) {
                        throw new Error('Network response was not okay');
                }
                return response.json();
        })
        .then(data => {
                console.log(data);
                if (data.message) {
                        document.getElementById('messageConnexion').innerHTML = data.message;
                } else {
                        document.getElementById('messageConnexion').innerHTML = data.error;
                }
        })
        .catch(error => {
                console.error('Error:', error);
                document.getElementById('messageConnexion').innerHTML = data.message;
        })
}

function inscriptionButton() {
        var username = document.getElementById('username').value;
        var email = document.getElementById('email').value;
        var password = document.getElementById('password').value;
        var passwordConfirmation = document.getElementById('passwordConfirmation').value;

        var data = {
                username: username,
                email: email,
                password: password,
                passwordConfirmation: passwordConfirmation
        };

        var crsf_token = document.getElementsByName('csrfmiddlewaretoken')[0].value;

        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('X-CSRFToken', crsf_token);

        fetch('/transcendence/create_user/', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data),
        })
        .then(response => {
                if (!response.ok) {
                        throw new Error('Network response was not okay');
                }
                return response.json();
        })
        .then(data => {
                console.log(data);
                if (data.message) {
                        document.getElementById('messageInscription').innerHTML = data.message;
                } else {
                        document.getElementById('messageInscription').innerHTML = data.error;
                }
        })
        .catch(error => {
                console.error('Error:', error);
                document.getElementById('messageInscription').innerHTML = data.message;
        })
}

function socket_function() {
        const socket = new WebSocket('ws://' + window.location.host + '/ws/some_path/');

        socket.onmessage = function(e) {
                const data = JSON.parse(e.data);
                console.log(data.message);

                if (data.type === 'chat') {
                        let message_send_back = document.getElementById('message_send_back');
                        message_send_back.innerHTML = data.message;
                 }
        }
        
        socket.onclose = function(e) {
                console.error('Chat socket closed');
        }

        let socket_test = document.getElementById('socket_test');
        socket_test.addEventListener('submit', (e) => {
                e.preventDefault();
                let message = socket_test.querySelector('#message').value;
                let targetUser = socket_test.querySelector('#target_user').value;
                socket.send(JSON.stringify({
                        'message': message,
                        'target_user': targetUser
                }))
                socket_test.reset();
        })
}

socket_function();

        // Call the fetchData function when the page loads
//document.addEventListener('DOMContentLoaded', fetchData);
