
async function getUsers(){
    
    try {
        
        
        const response = await fetch('http://localhost:3000/api/v1/user')
        
        const data = await response.json()
        
        console.log(data)
    } catch (error) {
        console.log(error)

    }

}

document.addEventListener('DOMContentLoaded', async ()=>{

    await getUsers()

    const button = document.createElement('BUTTON')

    button.innerText = "Luo käyttäjä"

    button.addEventListener('click', async ()=>{

        const response = await fetch('http://localhost:3000/api/v1/user', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                // testimielessä random käyttäjä
                username: "test1" + crypto.randomUUID(),
                password: "salasana",
                age: 50,
                role: 'user'
            })
        })

        if(!response.ok){
            alert("käyttäjän luonti epäonnistui")
            return
        }

        const data = await response.json()

        console.log(data)

        alert("Käyttäjä luotu onnistuneesti")

    })

    document.body.append(button)
})