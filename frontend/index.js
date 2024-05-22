const BASE_URL = "http://localhost:3000"

document.getElementById("signin").addEventListener("click", () => {
    const data = { name: 'Hosam', age: 30, pwd: "hixhi" };

    createClient(data)
})

async function createClient(data) {
    try {
        const response = await fetch(BASE_URL + '/clients', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const result = await response.text();
        console.log(result);
    } catch (error) {
        console.error('Error while creating a client:', error);
    }
}