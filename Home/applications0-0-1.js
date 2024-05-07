
// Fetch tutor applications from Firestore
function fetchTutorApplications() {
    const usersRef = database.collection('users');
    return usersRef.where('tutorApplicationStatus', 'in', ['pending', 'approved', 'declined'])
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                console.log('No matching documents.');
                return [];
            }

            let tutorApplications = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                data.id = doc.id; // Including the document ID
                tutorApplications.push(data);
            });

            // Sorting the applications by 'dateCreated'
            tutorApplications.sort((a, b) => parseDate(b.dateCreated) - parseDate(a.dateCreated));
            return tutorApplications;
        })
        .then(tutorApplications => {
            renderApplications(tutorApplications);
        })
        .catch(error => {
            console.error("Error fetching tutor applications: ", error);
            throw error;
        });
}




function renderApplications(applications) {
    applications.forEach(app => {
        // Parent Div
        const rowParent = createDOMElement('div', 'row-parent', '', applicantsContainer);

        // Profile Photo & Full Name
        let applicantNameDiv = createDOMElement('div', 'row-div-20', "", rowParent);
        if (app.profileImage && app.profileImage.trim() !== "") {
            createDOMElement('img', 'applicant-profile-photo', app.profileImage, applicantNameDiv);
        } else {
            const initials = getInitials(app.name);
            createDOMElement('div', 'profile-photo-default', initials, applicantNameDiv);
        }
        createDOMElement('div', 'row-text', app.name, applicantNameDiv);
        
        //School and Date Applied
        createDOMElement('div', 'row-div-20 row-text', getFullSchoolName(app.school), rowParent);
        createDOMElement('div', 'row-div-20 row-text', formatDate(app.dateCreated), rowParent);
        
        //Transcript
        let transcriptContainer = createDOMElement('div', 'row-div-20 row-text', '', rowParent);
        var transcriptButton = createDOMElement('div', 'transcript-button', '', transcriptContainer);
        createDOMElement('div', 'transcript-icon', '', transcriptContainer);
        createDOMElement('div', 'row-text', 'Transcript', transcriptContainer);
        transcriptButton.addEventListener('click', () => {
            window.open(app.transcriptURL);
        });
        
        //Actions
        let actionsContainer = createDOMElement('div', 'row-div-20', '', rowParent);
        
        if (app.tutorApplicationStatus == "pending") {
            let approveButton = createDOMElement('div', 'approve-button', 'Approve', actionsContainer);
            approveButton.addEventListener('click', () => {
                sendTutorApprovalData(app.email, app.name);
                console.log(app.email, app.name)
            });
            let declineButton = createDOMElement('div', 'decline-button', 'Decline', actionsContainer);
        } else if (app.tutorApplicationStatus == "declined") {
            createDOMElement('div', 'row-div-20', 'Declined', actionsContainer);
        } else if (app.tutorApplicationStatus == "approved") {
            createDOMElement('div', 'row-div-20', 'Approved', actionsContainer);
        }
        
    });
}

function sendTutorApprovalData(userEmail, userName) {
    fetch('https://tutortree-1f6f9e7e11c7.herokuapp.com/sendTutorAcceptanceEmail', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_email: userEmail,
            user_name: userName
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}



//Helper functions
function formatDate(timestamp) {
    const options = { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' };
    return parseDate(timestamp).toLocaleDateString('en-US', options);
}

function getInitials(fullName) {
    // Check if fullName is undefined or empty
    if (!fullName) {
        return ""; // Return an empty string or any default initials you prefer
    }
    
    const names = fullName.split(' ');
    let initials = names.map(name => {
        // Check if name is not empty to avoid errors
        if (name) {
            return name[0].toUpperCase();
        }
        return ''; // Return empty string if name part is undefined or empty
    }).join('');
    
    return initials.slice(0, 2);
}


// Improved parseDate function to safely handle undefined values
function parseDate(date) {
    if (!date) {
        // Handle undefined or null dates by returning a default old date
        return new Date(0);
    } else if (typeof date === 'number') {
        // Assuming the number is milliseconds since the epoch
        return new Date(date);
    } else if (date.seconds) {
        // Handle Firestore timestamp
        return new Date(date.seconds * 1000);
    } else {
        // Return a default old date if the format is unknown
        return new Date(0);
    }
}

