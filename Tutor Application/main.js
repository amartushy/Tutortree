
// The createDOMElement function as provided
function createDOMElement(type, className, value, parent) {
    let DOMElement = document.createElement(type);
    DOMElement.setAttribute('class', className);
    if (type == 'img') {
        DOMElement.src = value;
    } else {
        DOMElement.innerHTML = value;
    }
    parent.appendChild(DOMElement);
    return DOMElement
}



const transcriptFileContainer = document.getElementById('transcript-file-container')
const transcriptTextElement = document.getElementById('transcript-file-text');
transcriptFileContainer.style.display = 'none'
let transcriptFileText = ""

let currentUserID = ""
let selectedSchoolID = ""
let selectedCourses = {};
let globalAvailabilityData = {
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
    Sunday: 0
};


//Profile Section____________________________________________________________________________________________________________________________________________
document.getElementById("default-profile-photo").addEventListener('click', function() {
    document.getElementById('profile-photo-input').click();
});


document.addEventListener("DOMContentLoaded", function() {
    
    initializeProfileFieldListeners()
    updateCharCounter()
    
    // Firebase initialization here...
    
    var db = firebase.firestore();
    
    // Auth state changed event
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in, now you can get the user ID
            currentUserID = user.uid;
            const userRef = db.collection('users').doc(currentUserID);

            // Proceed to load and save user data as before
            function loadUserData() {
                userRef.get().then(doc => {
                    if (doc.exists) {

                        const userData = doc.data();
                        document.getElementById('name-field').value = userData.name || '';
                        document.getElementById('major-field').value = userData.major || '';
                        document.getElementById('year-field').value = userData.grade || '';
                        document.getElementById('bio-field').value = userData.bio || '';

                        var currentLength = bioField.value.length;
                        document.getElementById('char-counter').textContent = `${currentLength} of ${maxLength}`;
                        
                        // Check if the user has a tutor application status of pending, rejected, or accepted
                        if (["pending", "rejected", "accepted"].includes(userData.tutorApplicationStatus)) {
                            // Navigate directly to the submitted-section
                            $("#profile-section").css('display', 'none');

                            currentSectionIndex = sections.indexOf("submitted-section");
                            switchSection(currentSectionIndex);
                            updateProgressBar(currentSectionIndex);
                            updateButtonVisibility(currentSectionIndex);
                        } else {
                            // Continue with the normal flow for users without one of these statuses
                            // Your existing code for loading user data goes here
                        }

                        if (userData.profileImage != "") {

                            const photoContainer = document.getElementById('profile-photo-container')
                            while (photoContainer.firstChild) {
                                photoContainer.removeChild(photoContainer.firstChild)
                            }

                            const profileImage = createDOMElement('img', 'application-profile-image', userData.profileImage, photoContainer)
                            profileImage.addEventListener('click', function() {
                                document.getElementById('profile-photo-input').click();
                            });
                        }

                        if (userData.transcriptURL) {
                            let transcriptFileName = userData.transcriptURL.split('/').pop();
                            transcriptFileName = transcriptFileName.split('?')[0];
                            transcriptFileText = decodeURIComponent(transcriptFileName);
                            
                            // Set the text content with the clean file name
                            const transcriptTextElement = document.getElementById('transcript-file-text');
                            transcriptTextElement.textContent = ` ${transcriptFileText}`;
                            
                            transcriptFileContainer.style.display = 'flex';
                            checkNextButtonConditions()
                        }

                        if (userData && userData.availability) {
                            // Update globalAvailabilityData with fetched data
                            Object.keys(globalAvailabilityData).forEach(day => {
                                globalAvailabilityData[day] = userData.availability[day] || 0;
                            });
                            console.log("Updated globalAvailabilityData:", globalAvailabilityData);
                            // Initialize UI after successfully fetching and updating data
                            initAvailabilityUI();
                        }

                        //School Selection Update
                        selectedSchoolID = userData.school;
                        fetchAndDisplaySchools();
                        if ( selectedSchoolID != "" ) {
                            fetchSubjectsAndCourses(selectedSchoolID)
                        }
                        checkNextButtonConditions()

                        setTimeout(function() {
                            $("#loading-screen").fadeOut();
                        }, 2000); // 2000 milliseconds = 2 seconds


                    } else {
                        console.log("No user data found!");
                        fetchAndDisplaySchools();
                        checkNextButtonConditions()

                    }
                }).catch(error => {
                    console.log("Error getting user data:", error);
                    fetchAndDisplaySchools();
                    checkNextButtonConditions()

                });
            }


            // Load user data
            loadUserData();
            initAvailabilityUI()
        } else {
            // No user is signed in. Handle accordingly, e.g., redirect to login page
            console.log("No user is signed in.");
            location.href = 'https://www.tutortree.com/login';
        }
    });
});

function initializeProfileFieldListeners() {
    var bioField = document.getElementById('bio-field');
    bioField.addEventListener('input', updateCharCounter);
    bioField.addEventListener('blur', saveUserData);
    
    // Event listeners for inputs to trigger save on change
    document.getElementById('name-field').addEventListener('blur', saveUserData);
    document.getElementById('major-field').addEventListener('blur', saveUserData);
    document.getElementById('year-field').addEventListener('blur', saveUserData);
    document.getElementById('bio-field').addEventListener('blur', saveUserData);
}

function updateCharCounter() {
    var bioField = document.getElementById('bio-field');
    var charCounter = document.getElementById('char-counter');
    var maxLength = 400;
    var currentLength = bioField.value.length;
    charCounter.textContent = `${currentLength} of ${maxLength}`;
    // Toggle class based on character count
}


function saveUserData() {
    const name = document.getElementById('name-field').value;
    const major = document.getElementById('major-field').value;
    const year = document.getElementById('year-field').value;
    const bio = document.getElementById('bio-field').value;

    userRef.update({
        name: name,
        major: major,
        grade : year,
        bio : bio
    }).then(() => {
        console.log("User data updated successfully");
    }).catch(error => {
        console.error("Error updating user data: ", error);
    });

    checkNextButtonConditions()
}
