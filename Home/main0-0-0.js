
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


//Globals
let currentUserID = ""
let schoolLookupTable = {};


//References
const adminSchools = document.getElementById('admin-schools')
const adminApplicants = document.getElementById('admin-applicants')

const applicantsContainer = document.getElementById('applicants-container')
const schoolsContainer = document.getElementById('schools-container')

const applicationsTab = document.getElementById('applications-tab')
const schoolsTab = document.getElementById('schools-tab')


document.addEventListener("DOMContentLoaded", function() {
    applicantsContainer.innerHTML = ""
    buildSchoolLookupTable().then(() => {
        fetchTutorApplications();
    });
    
    buildSchoolsTable();
    
    applicantsContainer.style.display = 'block';
    schoolsContainer.style.display = 'none';
    applicationsTab.className = 'nav-item-selected';
    schoolsTab.className = 'nav-item';

    // Event listeners for tabs
    applicationsTab.addEventListener('click', function() {
        showApplicants();
    });

    schoolsTab.addEventListener('click', function() {
        showSchools();
    });

    
    // Auth state changed event
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // Update the global User ID
            currentUserID = user.uid;

        } else {
            console.log("No user is signed in.");
//            location.href = 'https://www.tutortree.com/login';
        }
    });
});


function showApplicants() {
    // Display the applicants container and hide the schools container
    adminApplicants.style.display = 'block';
    adminSchools.style.display = 'none';

    // Update tab classes
    applicationsTab.className = 'nav-item-selected';
    schoolsTab.className = 'nav-item';
}

function showSchools() {
    // Display the schools container and hide the applicants container
    adminSchools.style.display = 'block';
    adminApplicants.style.display = 'none';

    // Update tab classes
    applicationsTab.className = 'nav-item';
    schoolsTab.className = 'nav-item-selected';
}

