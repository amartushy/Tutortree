
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

