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

function switchSection(nextIndex) {
    $("#" + sections[currentSectionIndex]).fadeOut(300, function() {
        $(this).css('display', 'none');
        $("#" + sections[nextIndex]).css('display', 'flex').hide().fadeIn(300);
        currentSectionIndex = nextIndex;
        updateProgressBar(currentSectionIndex);
        updateButtonVisibility(currentSectionIndex);
        checkNextButtonConditions();
    });
}


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

    // Set initial states
updateProgressBar(currentSectionIndex);
updateButtonVisibility(currentSectionIndex);

$("#next-button").click(function() {
    // Check if the Next button is currently set as invalid before proceeding
    if (!$(this).hasClass('application-next-invalid') && currentSectionIndex < sections.length - 1) {
        switchSection(currentSectionIndex + 1);
    }

    if (currentSectionIndex === sections.length - 2) { // Assuming the "availability-section" is second to last
        submitApplication();
    }
});

$("#back-button").click(function() {
    if (currentSectionIndex > 0) {
        switchSection(currentSectionIndex - 1);
    }
});

document.getElementById("loading-screen").style.display = "flex"


function checkNextButtonConditions() {
    console.log("Checking button conditions for page: ", sections[currentSectionIndex])
    // Default: enable the Next button and set it as valid
    let enableNextButton = false;
    let nextButtonClass = 'application-next-invalid';

    // Based on the current section, check conditions
    switch (sections[currentSectionIndex]) {
        case 'profile-section':
            // Disable if any field is empty
            const name = $('#name-field').val();
            const major = $('#major-field').val();
            const year = $('#year-field').val();
            const bio = $('#bio-field').val();
            if (!name || !major || !year || !bio) {
                enableNextButton = false;
                nextButtonClass = 'application-next-invalid';
            } else {
                enableNextButton = true;
                nextButtonClass = 'application-next-valid';
            }
            break;
        case 'school-section':
            console.log("School ID: ", selectedSchoolID)
            // Disable if no school selected
            if (!selectedSchoolID) {
                enableNextButton = false;
                nextButtonClass = 'application-next-invalid';
            } else {
                enableNextButton = true;
                nextButtonClass = 'application-next-valid';
            }
            break;
        case 'courses-section':
            // Always enabled (Optional section)
            enableNextButton = true;
            nextButtonClass = 'application-next-valid';
            break;
        case 'upload-section':
            // Disable if no transcript uploaded
            if (!transcriptFileText) {
                enableNextButton = false;
                nextButtonClass = 'application-next-invalid';
            } else {
                enableNextButton = true;
                nextButtonClass = 'application-next-valid';
            }
            
            break;
        case 'availability-section':
            // Disable if no slots available
            const isAnyDayAvailable = Object.values(globalAvailabilityData).some(dayValue => dayValue !== 0);
            if (!isAnyDayAvailable) {
                enableNextButton = false;
                nextButtonClass = 'application-next-invalid';
            } else {
                enableNextButton = true;
                nextButtonClass = 'application-next-valid';
            }
            break;
    }

    // Update the Next button's class based on the check
    $('#next-button').removeClass('application-next-valid application-next-invalid')
                     .addClass(nextButtonClass);
    
    // Update the Next button's disabled property
    $('#next-button').prop('disabled', !enableNextButton);
}





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
            selectedSchoolID = schoolData.id
            fetchSubjectsAndCourses(schoolData.id)
            checkNextButtonConditions()

        }).catch(function(error) {
            console.error("Error updating school: ", error);
        });
    });
}



function convertToBinaryArray(num) {
    if (num === undefined || num === null) {
        console.warn('convertToBinaryArray received undefined or null, treating as 0');
        num = 0;
    }
    let binaryString = num.toString(2);
    let paddedString = binaryString.padStart(48, '0');
    return [...paddedString]; // Spread operator to convert string to array
}

// Converts a binary array back to an integer
function convertToInt(binaryArray) {
    let binaryString = binaryArray.join('');
    return parseInt(binaryString, 2);
}



function initAvailabilityUI() {
    // Define an array of days to iterate through
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    days.forEach(day => {
        // Fetch the column by ID
        const columnId = day.toLowerCase() + '-column'; // Construct the ID string
        const column = document.getElementById(columnId);

        if (!column) {
            console.error(`Column for ${day} not found`);
            return;
        }

        // Convert the availability data for the day to a binary array
        const binaryArray = convertToBinaryArray(globalAvailabilityData[day]);
        // Iterate through each slot in the column
        Array.from(column.children).forEach((slot, index) => {
            // Initially set all slots to empty-day-slot and clear any existing text
            slot.className = 'empty-day-slot';
            slot.textContent = "";

            // Check if the slot should be marked as available
            if (binaryArray[index] === '1') {
                slot.className = 'available-day-slot';
                slot.textContent = "AVAILABLE";
            }

            // Attach click event listener to toggle availability
            slot.addEventListener('click', function() {
                this.classList.toggle('available-day-slot');
                this.classList.toggle('empty-day-slot');
                this.textContent = this.classList.contains('available-day-slot') ? "AVAILABLE" : ""
                binaryArray[index] = this.classList.contains('available-day-slot') ? '1' : '0';

                // Update the global availability data for the day
                globalAvailabilityData[day] = convertToInt(binaryArray);
                console.log(`New availability for ${day}:`, globalAvailabilityData[day]);
                checkNextButtonConditions()
            });
        });
    });
}


function submitApplication() {
    // Process selectedCourses to remove HTML elements and keep only serializable data
    const processedSelectedCourses = Object.entries(selectedCourses).reduce((acc, [key, course]) => {
        // Extract only the serializable properties of each course
        const { subject, courseCode } = course;
        acc[key] = { subject, courseCode }; // Adjust according to the properties you need
        return acc;
    }, {});

    // Reference to the user's document in Firestore
    const userRef = database.collection('users').doc(currentUserID);

    // Prepare the update data, including the processed selectedCourses
    const updateData = {
        availability: globalAvailabilityData,
        selectedCourses: processedSelectedCourses, // Use the processed version
        tutorApplicationStatus: "pending"
    };

    // Perform the update
    userRef.update(updateData).then(() => {
        console.log("Application submitted successfully.");
        sendApplicationToServer(currentUserID);

    }).catch(error => {
        console.error("Error submitting application:", error);
    });
}


function sendApplicationToServer(userID) {
    fetch('https://tutortree-1f6f9e7e11c7.herokuapp.com/sendTutorApplicationEmail', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userID: userID })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log("Server response:", data.status);
    })
    .catch(error => {
        console.error("Error sending data to server:", error);
    });
}

