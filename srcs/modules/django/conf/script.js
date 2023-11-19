function fetchData() {
        fetch('/transcendence/get_data/')
                .then(response => response.json())
                .then(data => {
                        console.log(data);
                        var sucessElement = document.getElementById('sucess-message');
                        sucessElement.textContent = data.message;
                })
                .catch(error => console.error('Error:', error));
}

function testFunction()
{
        fetch('/transcendence/create_object/');
        console.log('test');
}

testFunction();

        // Call the fetchData function when the page loads
document.addEventListener('DOMContentLoaded', fetchData);
