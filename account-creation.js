


//Globals
let errorText = document.getElementById("error-text")


//Onload
document.addEventListener('DOMContentLoaded', function () {
    errorText.style.display = "none"
    
    const createAccountButton = document.getElementById('create-account-button');
    if (createAccountButton) {
        createAccountButton.addEventListener('click', createUserAccount);
    }
});


async function createUserAccount() {
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const email = document.getElementById('school-email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        errorText.style.display = "flex"
        errorText.innerHTML = "Your passwords don't match"
        return;
    }

    try {
        // Create user with Firebase Authentication
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // User additional data
        const userData = {
            id: user.uid,
            bio: "",
            badges: [],
            currentBalance: 0.0,
            completedOnboarding: false,
            dateCreated: firebase.firestore.FieldValue.serverTimestamp(),
            dateLastOnline: firebase.firestore.FieldValue.serverTimestamp(),
            email: email,
            name: `${firstName} ${lastName}`,
            isOnline: true,
            isDarkModeOn: true,
            isTutor: false,
            isPushOn: false,
            isEmailOn: false,
            isSMSOn: false,
            isPromotionalOn: false,
            major: "",
            phoneNumber: "",
            profileImage: "",
            pushToken: "",
            school: ""
        };

        // Save user data to Firestore
        await database.collection('users').doc(user.uid).set(userData)
        
        window.location.href = '/tutor-application';

    } catch (error) {
        console.error("Error creating user account:", error);
        alert("Failed to create user account: " + error.message);
        errorText.style.display = "flex"
        errorText.innerHTML = error.message

    }
}
