$(document).ready(function() {
    let sections = [
        "profile-section",
        "school-section",
        "courses-section",
        "upload-section",
        "availability-section",
        "submitted-section"
    ];

    let progressIds = [
        "progress-profile",
        "progress-school",
        "progress-courses",
        "progress-transcript",
        "progress-availability",
        "progress-complete"
    ];

    let currentSectionIndex = 0;

    sections.forEach((sectionId, index) => {
        if (index === 0) {
            $("#" + sectionId).css('display', 'flex');
        } else {
            $("#" + sectionId).css('display', 'none');
        }
    });

    function updateProgressBar(currentIndex) {
        progressIds.forEach((id, index) => {
            let progressDiv = $("#" + id);
            if (index <= currentIndex) {
                progressDiv.removeClass("progress-div-incomplete").addClass("progress-div-complete");
            } else {
                progressDiv.removeClass("progress-div-complete").addClass("progress-div-incomplete");
            }
        });
    }
    
    function updateButtonVisibility(currentIndex) {
        // Hide the back button on the first and the last section
        if (currentIndex === 0 || currentIndex === sections.length - 1) {
            $("#back-button").hide();
        } else {
            $("#back-button").show();
        }

        // Change the text of the next button to "Submit Application" on the availability section
        // Assuming the "availability-section" is second to last
        if (currentIndex === sections.length - 2) {
            $("#next-button").text("Submit Application");
        } else {
            $("#next-button").text("Next");
        }

        // Hide the next button on the last section
        if (currentIndex === sections.length - 1) {
            $("#next-button").hide();
        } else {
            $("#next-button").show();
        }
    }

    function switchSection(nextIndex) {
        $("#" + sections[currentSectionIndex]).fadeOut(300, function() {
            $(this).css('display', 'none');
            $("#" + sections[nextIndex]).css('display', 'flex').hide().fadeIn(300);
            currentSectionIndex = nextIndex;
            updateProgressBar(currentSectionIndex);
            updateButtonVisibility(currentSectionIndex);

        });
    }

		// Set initial states
    updateProgressBar(currentSectionIndex); 
    updateButtonVisibility(currentSectionIndex);

    $("#next-button").click(function() {
        if (currentSectionIndex < sections.length - 1) {
            switchSection(currentSectionIndex + 1);
        }
    });

    $("#back-button").click(function() {
        if (currentSectionIndex > 0) {
            switchSection(currentSectionIndex - 1);
        }
    });
});


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
const transcriptFileText = ""

let currentUserID = ""
let selectedSchoolID = ""
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
                            // User already has a transcript uploaded
                            const transcriptFileName = userData.transcriptURL.split('/').pop(); // Assuming the URL structure allows this
                            const transcriptTextElement = document.getElementById('transcript-file-text');
                            transcriptTextElement.textContent = ` ${decodeURIComponent(transcriptFileName)}`;

                            transcriptFileContainer.style.display = 'flex'

                        }

                        if (userData.availability) {
                            // Update globalAvailabilityData with fetched data
                            Object.keys(globalAvailabilityData).forEach(day => {
                                if (userData.availability[day] !== undefined) {
                                    globalAvailabilityData[day] = userData.availability[day];
                                }
                            });
                        }
                        initAvailabilityUI();

                        //School Selection Update
                        selectedSchoolID = userData.school;
                        fetchAndDisplaySchools();
                        if ( selectedSchoolID != "" ) {
                            fetchSubjectsAndCourses(selectedSchoolID)
                        }

                    } else {
                        console.log("No user data found!");
                        fetchAndDisplaySchools();
                        initAvailabilityUI();
                    }
                }).catch(error => {
                    console.log("Error getting user data:", error);
                    fetchAndDisplaySchools();
                    initAvailabilityUI();
                });
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
            }

            // Event listeners for inputs to trigger save on change
            document.getElementById('name-field').addEventListener('blur', saveUserData);
            document.getElementById('major-field').addEventListener('blur', saveUserData);
            document.getElementById('year-field').addEventListener('blur', saveUserData);
            document.getElementById('bio-field').addEventListener('blur', saveUserData);

            // Additional event listeners...

            // Load user data
            loadUserData();
        } else {
            // No user is signed in. Handle accordingly, e.g., redirect to login page
            console.log("No user is signed in.");
            location.href = 'https://www.tutortree.com/login';
        }
    });
});


// Handle file selection
document.getElementById('profile-photo-input').addEventListener('change', function(event) {
    if (event.target.files.length > 0) {
        var file = event.target.files[0];
        uploadImage(file);
    }
});

function uploadImage(file) {
    // Create a storage ref
    var storageRef = storage.ref('test_profileImages/' + currentUserID + '/profilePhoto.jpg');

    // Upload file
    var uploadTask = storageRef.put(file);

    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
        function(snapshot) {
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
        }, function(error) {
            console.log(error);
        }, function() {
            // Upload completed successfully, now we can get the download URL
            uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                console.log('File available at', downloadURL);
                // Optionally, save the URL to Firestore
                database.collection('users').doc(currentUserID).update({
                    profileImage: downloadURL
                });
                const photoContainer = document.getElementById('profile-photo-container')
                while (photoContainer.firstChild) {
                    photoContainer.removeChild(photoContainer.firstChild)
                }
                const profileImage = createDOMElement('img', 'application-profile-image', downloadURL, photoContainer)
                profileImage.addEventListener('click', function() {
                    document.getElementById('profile-photo-input').click();
                });
            });
        });
}


















const schoolSearchResults = document.getElementById('school-search-results')
let allSchools = [];


function fetchAndDisplaySchools() {

    schoolSearchResults.innerHTML = '';

    const schoolsRef = database.collection('schools'); 
    schoolsRef.get().then((querySnapshot) => {
        allSchools = []; 
        querySnapshot.forEach((doc) => {
            const schoolData = { id: doc.id, ...doc.data() }; // Include the document ID in the schoolData object
            allSchools.push(schoolData);
        });
        displaySchools(allSchools);
    }).catch((error) => {
        console.log("Error getting documents: ", error);
    });
}


// Function to display schools given an array of school data
function displaySchools(schoolsArray) {
    schoolSearchResults.innerHTML = '';

    schoolsArray.sort((a, b) => a.title.localeCompare(b.title));

    schoolsArray.forEach(schoolData => {
        createSchoolItem(schoolData, schoolSearchResults);
    });

    // Scroll to the selected school, if any
    if (selectedSchoolID) {
        const selectedSchoolDiv = document.getElementById(selectedSchoolID);
        if (selectedSchoolDiv) {
            selectedSchoolDiv.scrollIntoView();
        }
    }
}

// Search field functionality
document.getElementById('school-search-field').addEventListener('input', function(e) {
    const searchQuery = e.target.value.toLowerCase();
    const filteredSchools = allSchools.filter(school => school.title.toLowerCase().includes(searchQuery));
    displaySchools(filteredSchools);
});


function createSchoolItem(schoolData, schoolSearchResults) {
    let schoolResultDiv = createDOMElement('div', 'school-result-div', '', schoolSearchResults);
    schoolResultDiv.id = schoolData.id; 
    if (schoolData.id === selectedSchoolID) {
        schoolResultDiv.classList.add('school-result-div-selected');
    }

    let schoolTitleContainer = createDOMElement('div', 'school-title-container', '', schoolResultDiv);
    createDOMElement('img', 'school-logo', schoolData.icon, schoolTitleContainer);
    createDOMElement('div', 'school-title', schoolData.title, schoolTitleContainer);

    let iconContent = schoolData.id === selectedSchoolID ? '' : ''; // Assuming '' is a checkmark, '' is a chevron
    let iconElement = createDOMElement('div', "chevron", iconContent, schoolResultDiv);

    // Event listener for each school result div
    schoolResultDiv.addEventListener('click', function() {
        // Revert the previously selected icon back to a chevron

        document.querySelectorAll('.chevron').forEach(item => {
            item.innerHTML = ''; //Reset to chevrons
        });

        // Update the current icon to a checkmark
        iconElement.innerHTML = '';

        // Add 'school-result-div-selected' class to the clicked div
        document.querySelectorAll('.school-result-div-selected').forEach(item => {
            item.classList.remove('school-result-div-selected');
        });
        schoolResultDiv.classList.add('school-result-div-selected');

        // Update the user's school in Firestore
        var userRef = database.collection('users').doc(currentUserID);
        userRef.update({
            school: schoolData.id 
        }).then(function() {
            console.log("School updated successfully!");
            fetchSubjectsAndCourses(schoolData.id)
        }).catch(function(error) {
            console.error("Error updating school: ", error);
        });
    });
}
