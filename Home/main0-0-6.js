
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
const adminApplicants = document.getElementById('admin-applications')

const applicantsContainer = document.getElementById('applicants-container')
const schoolsContainer = document.getElementById('schools-container')

const applicationsTab = document.getElementById('applications-tab')
const schoolsTab = document.getElementById('schools-tab')


document.addEventListener("DOMContentLoaded", function() {
    applicantsContainer.innerHTML = ""
    schoolsContainer.innerHTML = ""
    buildSchoolsTable().then(() => {
        fetchTutorApplications();
    });
        
    adminApplicants.style.display = 'none';
    adminSchools.style.display = 'block';
    schoolsTab.className = 'nav-item-selected';
    applicationsTab.className = 'nav-item';

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


const subjectBackgrounds = {
    "brain": "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fbrain.jpg?alt=media&token=299eeac1-954b-490b-ab95-1fa81d691964",
    "communication": "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fcommunication.jpg?alt=media&token=5a3c6357-1450-40b1-bc0d-961bb98f91c3",
    "dance": "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fdance.jpg?alt=media&token=6855428e-fa79-4858-877a-69679efd418f",
    "data": "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fdata.jpg?alt=media&token=b1ebc586-7ad9-48d0-a82d-9159ef88918c",
    "design": "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fdesign.jpg?alt=media&token=36a68b21-d07d-4dc3-935a-e59d07e422d1",
    "digital": "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fdigital.jpg?alt=media&token=d38b6a14-b741-4810-b5b2-6762ebc9ccd8",
    "disease": "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fdisease.jpg?alt=media&token=7b2c6cf8-0335-42dd-93af-da1d4883c0c6",
    "earth": "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fearth.jpg?alt=media&token=e685779b-a487-49a0-a812-e685efcb11d1",
    "ecology": "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fecology.jpg?alt=media&token=4834d7e6-d524-4075-9e8f-b579abe40c10",
    "education": "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Feducation.jpg?alt=media&token=4b003b35-7fad-4381-a6aa-e634ff73021e",
    "electrical-engineering": "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Felectrical-engineering.jpg?alt=media&token=e7cfa3fc-4d44-4bfa-befc-90a4e1590fe2",
    "engineering": "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fengineering.jpg?alt=media&token=993be34e-58f0-497c-a56f-18a29306924f",
    "english": "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fenglish.jpg?alt=media&token=fe79a443-e73d-4a31-bbd3-5efcae77069a",
    "feminist": "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Ffeminist.jpg?alt=media&token=5301b9e8-eea1-46e7-9ffc-5979d927a9e2",
    "film-studies": "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Ffilm-studies.jpg?alt=media&token=f98f3e46-baef-4419-b34e-cfb69bbc16bf",
    "food": "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Ffood.jpg?alt=media&token=c22114fa-475a-4c8c-883f-d5776d824dc9",
    "german": "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fgerman.jpg?alt=media&token=b245d15d-06e4-4108-8894-e3928cef2baf",
    "health-studies": "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fhealth-studies.jpg?alt=media&token=9707953e-da77-40e8-b0aa-400f6889a177",
    "human-biology": "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fhuman-biology.jpg?alt=media&token=ce7943e4-3eb5-4936-8b5b-0bcc3001ef65",
    "human-physiology": "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fhuman-physiology.jpg?alt=media&token=d66e0898-8499-4fa9-a879-502bff893c1c",
    "italian": "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fitalian.jpg?alt=media&token=d8ac37f9-3132-4f7d-8bd0-b0a3f9158bfe",
    "latin-america": "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Flatin-america.jpg?alt=media&token=f510af5e-fe94-4a72-8dd2-ed00e47b66e9",
    "life-sciences": "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Flife-sciences.jpg?alt=media&token=a24ebf08-d1d4-4063-9e60-70fa4d7b9983",
    "management": "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fmanagement.jpg?alt=media&token=36e0efa2-dda0-42b2-a588-240b198c98b4",
    "materials": "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fmaterials.jpg?alt=media&token=fa38247b-1d13-4c42-99d6-a8739a439457",
    "microbiology": "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fmicrobiology.jpg?alt=media&token=a917f45a-951f-4d65-93b5-f4852354f771",
    "nano": "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fnano.jpg?alt=media&token=3bf12b40-2bc7-4ab7-b2e9-373c0ca9dec9",
    "nuclear-engineering": "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fnuclear-engineering.jpg?alt=media&token=ffd0f6ce-e86f-4f9b-aa46-3177512ac6c7",
    "oceanography": "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Foceanography.jpg?alt=media&token=40a29c72-4cb2-4e9b-bdb4-35b3b336c288",
    "planetary-science": "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fplanetary-science.jpg?alt=media&token=6de028be-c821-4271-a17c-7d7432501c80",
    "robotics": "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Frobotics.jpg?alt=media&token=14464c8e-de88-4b89-af08-beb9ed75b151",
    "slavic": "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fslavic.jpg?alt=media&token=cbcdb67e-a0a3-4146-a9a2-b4550296974d",
    "spanish": "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fspanish.jpg?alt=media&token=5eb7f652-a82a-41fe-9380-95cfec8c2e7d",
    "sports-medicine": "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fsports-medicine.jpg?alt=media&token=8a6ac5dc-ea00-4cf2-8f01-0a00c954b178",
    "statistics": "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fstatistics.jpg?alt=media&token=3d7a679f-190e-464e-8150-351c1750509b",
    "structural": "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fstructural.jpg?alt=media&token=dce0f9d8-f335-4ef2-8cd7-177864dcde12",
    "theater": "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Ftheater.jpg?alt=media&token=52366186-7c36-40a6-b2ba-68c2a3ca6ac3",
};

