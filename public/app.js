
// Helper functions
async function getLoginState() {
    try {
        const response = await fetch('http://localhost:3000/api/v1/user/account', {
            method: 'GET',
            credentials: 'include',
        });

        if (response.status === 200) {
            // Get the user role from the response
            const userData = await response.json();
            return {
                isLoggedIn: true,
                role: userData.role,
            };
        } else {
            return {
                isLoggedIn: false,
                role: null,
            };
        }
    }
    catch (error) {
        return {
            isLoggedIn: false,
            role: null,
        };
    }
}

async function login(username, password) {
    console.log('Logging in as ' + username);
    const response = await fetch('http://localhost:3000/api/v1/user/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            password: password,
        }),
    });

    if (!response.ok) {
        throw new Error('Login failed');
    }

    console.log('Logged in successfully');

    // Fetch user data after successful login
    const userDataResponse = await fetch('http://localhost:3000/api/v1/user/account', {
        credentials: 'include',
    });

    if (!userDataResponse.ok) {
        throw new Error('Failed to fetch user data');
    }

    const userData = await userDataResponse.json();

    return userData.role;
}

async function createUser(username, password, age, role) {
    const response = await fetch('http://localhost:3000/api/v1/user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            password: password,
            age: age,
            role: role
        }),
    });

    if (!response.ok) {
        throw new Error('User creation failed');
    }

    console.log('User created successfully');
}

async function createNote(content) {
    const response = await fetch('http://localhost:3000/api/v1/note', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            content: content,
        }),
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Note creation failed');
    }

    console.log('Note created successfully');
}

async function fetchAndDisplayNotes() {
    try {
        const response = await fetch('http://localhost:3000/api/v1/note', {
            credentials: 'include',
        });

        const notes = await response.json()

        // Clear the note list
        const noteList = document.getElementById('noteList');
        noteList.innerHTML = '';

        // Add each note to the note list
        notes.forEach(note => {
            const li = document.createElement('LI');
            //li.innerText = note.content;

            // Create a div for the buttons
            const buttonDiv = document.createElement('DIV');

            // Create update form
            const updateForm = document.createElement('FORM');
            updateForm.className = 'inlineElement';
            const updateInput = document.createElement('TEXTAREA');
            updateInput.value = note.content;
            const updateButton = document.createElement('BUTTON');
            updateButton.innerText = 'Update';
            updateButton.type = 'submit';
            updateForm.append(updateInput, updateButton);

            updateForm.addEventListener('submit', (event) => {
                event.preventDefault();
                updateNoteHandler(note.id, updateInput.value);
                updateButton.style.backgroundColor = "";
            });

            updateInput.addEventListener('input', () => {
                updateButton.style.backgroundColor = "red";
            });

            buttonDiv.append(updateForm);

            // Create delete button
            const deleteButton = document.createElement('BUTTON');
            deleteButton.innerText = 'Delete';
            deleteButton.className = 'inlineElement';
            deleteButton.addEventListener('click', () => deleteNoteHandler(note.id));

            buttonDiv.append(deleteButton);
            li.append(buttonDiv);
            noteList.append(li);
        });
    } catch (error) {
        console.log(error);
        alert("Error fetching notes");
    }
}

// Event handlers
async function submitLoginHandler(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    let role;

    try {
        role = await login(username, password);
        console.log("Logged in as: " + role)

        // Reload the page to update the UI
        location.reload();
    } catch (error) {
        console.warn('Login failed');
    }
}

async function logoutHandler(event) {
    event.preventDefault();
    const response = await fetch('http://localhost:3000/api/v1/user/logout', {
        method: 'POST',
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Logout failed');
    }

    console.log('Logged out successfully');

    // Reload the page after logout
    location.reload();
}

async function userCreationHandler(event) {
    event.preventDefault();
    const username = document.getElementById('new_username').value;
    const password = document.getElementById('new_password').value;
    const age = document.getElementById('new_age').value;
    const role = document.getElementById('new_role').value;

    try {
        await createUser(username, password, age, role);
        alert('User created successfully');
    } catch (error) {
        console.error(error);
        alert('User creation failed');
    }
}

async function deleteUserHandler(userId) {
    try {
        const response = await fetch(`http://localhost:3000/api/v1/user/${userId}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (!response.ok) {
            console.error('User deletion failed');
        }

        console.log('User deleted successfully');

        // Fetch and display users again
        await getUsersHandler();
    } catch (error) {
        console.error(error);
        alert('User deletion failed');
    }
}

async function getUsersHandler(event) {
    if (event) event.preventDefault();
    try {
        const response = await fetch('http://localhost:3000/api/v1/user', {
            credentials: 'include',
        });

        const data = await response.json()

        // If a table exists, remove it
        const extTable = document.querySelector('TABLE')
        if (extTable) {
            extTable.remove()
        }

        // Create a table to show the data
        const table = document.createElement('TABLE')
        const thead = document.createElement('THEAD')
        const tbody = document.createElement('TBODY')
        const tr = document.createElement('TR')

        const th1 = document.createElement('TH')
        th1.innerText = "ID"

        const th2 = document.createElement('TH')
        th2.innerText = "Username"

        const th3 = document.createElement('TH')
        th3.innerText = "Age"

        const th4 = document.createElement('TH')
        th4.innerText = "Role"

        const th5 = document.createElement('TH')
        th5.innerText = "Actions"

        tr.append(th1, th2, th3, th4, th5)

        thead.append(tr)

        table.append(thead)

        data.forEach(user => {
            const tr = document.createElement('TR')

            const td1 = document.createElement('TD')
            td1.innerText = user.id

            const td2 = document.createElement('TD')
            td2.innerText = user.username

            const td3 = document.createElement('TD')
            td3.innerText = user.age

            const td4 = document.createElement('TD')
            td4.innerText = user.role

            const td5 = document.createElement('TD')
            const deleteButton = document.createElement('BUTTON');
            deleteButton.innerText = 'Delete';
            deleteButton.addEventListener('click', () => deleteUserHandler(user.id));
            td5.append(deleteButton);

            tr.append(td1, td2, td3, td4, td5)

            tbody.append(tr)

        })

        table.append(tbody)

        document.body.append(table)

    } catch (error) {
        console.log(error)

        // Show an alert if there is an error
        alert("Error fetching users (are you logged in?)")
    }
}

async function submitNoteHandler(event) {
    event.preventDefault();
    const content = document.getElementById('noteContent').value;

    try {
        await createNote(content);

        // Clear the form
        document.getElementById('noteContent').value = '';

        // Fetch and display notes
        await fetchAndDisplayNotes();
    } catch (error) {
        console.error(error);
        alert('Note creation failed');
    }
}

async function updateNoteHandler(noteId, newContent) {
    try {
        const response = await fetch(`http://localhost:3000/api/v1/note`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: noteId,
                content: newContent,
            }),
            credentials: 'include',
        });

        if (!response.ok) {
            console.error('Note update failed');
        }

        console.log('Note updated successfully');

        // Fetch and display notes again
        await fetchAndDisplayNotes();
    } catch (error) {
        console.error(error);
        alert('Note update failed');
    }
}

async function deleteNoteHandler(noteId) {
    try {
        const response = await fetch(`http://localhost:3000/api/v1/note/${noteId}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (!response.ok) {
            console.error('Note deletion failed');
        }

        console.log('Note deleted successfully');

        // Fetch and display notes
        await fetchAndDisplayNotes();
    } catch (error) {
        console.error(error);
        alert('Note deletion failed');
    }
}

// Page construction
async function constructPage(isLoggedIn, role) {
    if (isLoggedIn) {
        // Create note form
        const noteForm = document.createElement('FORM');
        noteForm.innerHTML = `
        <textarea id="noteContent" placeholder="Note content"></textarea>
        <button type="submit">Create Note</button>
        `;
        document.body.append(noteForm);

        // Create note list
        const noteList = document.createElement('UL');
        noteList.id = 'noteList';
        document.body.append(noteList);

        // Handle note form submission
        noteForm.addEventListener('submit', submitNoteHandler);

        // Fetch and display notes
        await fetchAndDisplayNotes();

        // Show getUsers button only if the user is an admin
        if (role === 'admin') {
            const getUsersButton = document.createElement('BUTTON');
            getUsersButton.innerText = "Get Users";
            getUsersButton.addEventListener('click', getUsersHandler);
            document.body.append(getUsersButton);
        } else {
            const warning = document.createElement('P');
            warning.innerText = "Only admin accounts can view all users.";
            document.body.append(warning);
        }

        // Create logout button
        const logoutButton = document.createElement('BUTTON');
        logoutButton.innerText = "Logout";
        logoutButton.addEventListener('click', logoutHandler);
        document.body.append(logoutButton);
    } else {
        // Create login form
        const loginForm = document.createElement('FORM');
        loginForm.innerHTML = `
        <input type="text" id="username" placeholder="Username">
        <input type="password" id="password" placeholder="Password">
        <button type="submit">Login</button>
        `;
        document.body.append(loginForm);

        // Handle login form submission
        loginForm.addEventListener('submit', submitLoginHandler);

        // Create signup form
        const createUserForm = document.createElement('FORM');
        createUserForm.innerHTML = `
        <input type="text" id="new_username" placeholder="New Username">
        <input type="password" id="new_password" placeholder="New Password">
        <input type="number" id="new_age" placeholder="Age">
        <input type="text" id="new_role" placeholder="Role">
        <button type="submit">Create User</button>
        `;
        document.body.append(createUserForm);

        // Handle user creation form submission
        createUserForm.addEventListener('submit', userCreationHandler);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const loginState = await getLoginState();

    console.log("Login state: ", loginState)

    await constructPage(loginState.isLoggedIn, loginState.role)
});