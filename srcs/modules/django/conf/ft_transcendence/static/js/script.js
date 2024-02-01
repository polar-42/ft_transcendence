const { FetchCancelSignal } = require("ethers");

function checkConnexion() {
        var crsf_token = document.getElementsByName('csrfmiddlewaretoken')[0].value;

        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('X-CSRFToken', crsf_token);

        fetch('/transcendence/check_connexion')
                .then(response => response.json())
                .then(data => {
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

        fetch('/transcendence/check_disconnexion')
                .then(response => response.json())
                .then(data => {
                        document.getElementById('checkDisconnexionText').innerHTML = data.message;
                        document.reload();
                })
                .catch(error => {
                        console.error('Error:', error);
                });
}

function connexionButton() {
        //Forbidden (CSRF token from the 'X-Csrftoken' HTTP header incorrect.): /transcendence/connect_user/

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
                        location.reload();
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
                        socket_function();
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

        var crsf_token = document.getElementsByName('csrfmiddlewaretoken')[0].value;

        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('X-CSRFToken', crsf_token);

        fetch('/transcendence/check_connexion/')
                .then(response => response.json())
                .then(data => {
                        console.log(data.connexionStatus);
                        if (data.connexionStatus == true) {

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

                                return (socket);
                        }

                })
                .catch(error => {
                        console.error('Error:', error);
                });
}

//socket_function();

function startGame(playerToPlayAgainst) {

        var crsf_token = document.getElementsByName('csrfmiddlewaretoken')[0].value;

        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('X-CSRFToken', crsf_token);

        var checkConnexion = false;

        fetch('/transcendence/check_connexion/')
                .then(response => response.json())
                .then(data => {
                        checkConnexion = data.connexionStatus;

                        if (checkConnexion == false) {
                                document.getElementById('test_game_message').innerHTML = 'You re not connected';
                                return;
                        }
                })
                .catch(error => {
                        console.error('Error:', error);
                });
        
                fetch('/transcendence/create_game/', {
                        method: 'POST',
                        headers: headers,
                        body: JSON.stringify({
                                playerToPlayAgainst: playerToPlayAgainst,
                        }),
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Game created:', data.game);
                })
                .catch(error => {
                    console.error('Error creating game:', error);
                });

        //requestAnimationFrame(startGame);
}
