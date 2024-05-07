
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
        let transcriptContainer = createDOMElement('div', 'row-div-20', '', rowParent);
        var transcriptButton = createDOMElement('div', 'transcript-button', '', transcriptContainer);
        createDOMElement('div', 'transcript-icon', '', transcriptButton);
        createDOMElement('div', 'row-text', 'Transcript', transcriptButton);
        transcriptButton.addEventListener('click', () => {
            window.open(app.transcriptURL);
        });
        
        //Actions
        let actionsContainer = createDOMElement('div', 'row-div-20', '', rowParent);
        
        if (app.tutorApplicationStatus == "pending") {
            let approveButton = createDOMElement('div', 'approve-button', 'Approve', actionsContainer);
            approveButton.addEventListener('click', () => {
                approveTutor(app.id, app)
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




async function approveTutor(tutorId, tutorData) {
    try {
        const tutorRef = database.collection('users').doc(tutorId);
        await tutorRef.update({
            tutorApplicationStatus: "approved",
            isTutor: true
        });

        // Send an acceptance email to the tutor
        sendTutorApprovalData(tutorData.email, tutorData.name);

        addTutorToCourses(tutorId, tutorData.school, tutorData.selectedCourses)
        
        applicantsContainer.innerHTML = ""
        fetchTutorApplications()
    } catch (error) {
        console.error('Error approving tutor:', error);
    }
}

async function addTutorToCourses(tutorId, schoolID, selectedCourses) {
    if (!selectedCourses) {
        console.error('No courses selected by the tutor.');
        return;
    }

    try {
        const schoolRef = database.collection('schools').doc(schoolID);

        for (const courseKey of Object.keys(selectedCourses)) {
            const { subject, courseCode } = selectedCourses[courseKey];

            const coursesRef = schoolRef.collection('courses').doc(subject);

            const courseDoc = await coursesRef.get();
            if (!courseDoc.exists) {
                console.log(`No course found for ${courseCode} in subject ${subject}.`);
                continue;
            }

            const courseData = courseDoc.data();
            const courseField = courseData[courseCode];

            if (!courseField.tutors) {
                courseField.tutors = {};
            }

            courseField.tutors[tutorId] = tutorId;

            await coursesRef.update({
                [courseCode]: courseField
            });

            console.log(`Added tutor ${tutorId} to course ${courseCode} under subject ${subject}.`);
        }
    } catch (error) {
        console.error('Error adding tutor to courses:', error);
    }
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
    if (!fullName) {
        return "";
    }
    
    const names = fullName.split(' ');
    let initials = names.map(name => {
        if (name) {
            return name[0].toUpperCase();
        }
        return '';
    }).join('');
    
    return initials.slice(0, 2);
}


function parseDate(date) {
    if (!date) {
        return new Date(0);
    } else if (typeof date === 'number') {
        return new Date(date);
    } else if (date.seconds) {
        return new Date(date.seconds * 1000);
    } else {
        return new Date(0);
    }
}

