
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
    "accounting":    "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Faccounting.jpg?alt=media&token=2b642b8c-f0c2-44cd-8265-b0d3866da694",
    "advertising":    "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fadvertising.jpg?alt=media&token=b791add8-c693-418f-91ac-485aea0094d2",
    "aerospace":    "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Faerospace.jpg?alt=media&token=a6970142-1a79-4e66-b767-0d10dad964ee",
    "africana":    "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fafricana.jpeg?alt=media&token=d877fca7-cda9-491e-9bb3-99b149a526d2",
    "animation":    "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fanimation.jpg?alt=media&token=86d390ee-b64e-4a3c-9477-394133d1d62d",
    "anthropology":    "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fanthropology.jpg?alt=media&token=3406e786-74cc-4a31-9f7f-45437ccf128d",
    "arabic" :   "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Farabic.jpg?alt=media&token=826ec737-5b96-427e-bb0a-129240cd1c8b",
    "art-history"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fart-history.jpg?alt=media&token=bd6f40a4-2cf0-4669-b81e-6c6b8f8801ee",
    "art"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fart.jpg?alt=media&token=77b3f7fd-78ff-4e6b-9559-2c609e63a45a",
    "asian"   : "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fasian.jpg?alt=media&token=6adedd41-f07e-4dbe-a86f-d0963cde128f",
    "astronomy"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fastronomy.jpg?alt=media&token=f46fcb10-1ced-461c-8ad8-ba699181934d",
    "biochemistry"   : "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fbiochemistry.jpg?alt=media&token=07c7899e-50e5-493b-90d7-aac97f004673",
    "biology" :   "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fbiology.jpg?alt=media&token=d812a6d6-dbbb-4205-82dd-4c5aa043e81c",
    "brain" :   "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fbrain.jpg?alt=media&token=37c1620d-ceff-423c-acc1-b017dbc89dee",
    "business"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fbusiness.jpg?alt=media&token=1be3b413-3784-4ec2-bc13-b9411c79f351",
    "cells"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fcells.jpg?alt=media&token=7b3d6452-5139-43ac-b2d2-9cf70477e0a2",
    "chemical-engineering"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fchemical-engineering.jpg?alt=media&token=00e34057-ab8f-4598-b6bb-fd9762f7abb6",
    "chemistry" :   "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fchemistry.jpg?alt=media&token=95e42f42-7ccb-45f9-9bba-b7b0dcac8db2",
    "child-development"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fchild-development.jpg?alt=media&token=14e45b2d-6c44-48b2-b9d7-25e4b28e0842",
    "civil-engineering"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fcivil-engineering.jpg?alt=media&token=c5755137-a7e4-4413-84be-4e13ab1db44f",
    "communication"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fcommunication.jpg?alt=media&token=6c255404-cf16-4542-98b0-87711582629e",
    "computer-network"   : "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fcomputer-network.jpg?alt=media&token=73fce4ae-1c3c-4333-a183-19e5b53f4091",
    "dance"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fdance.jpg?alt=media&token=626f152b-346b-42a1-b084-5bc5235f049a",
    "data"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fdata.jpg?alt=media&token=f39829b6-38fb-4e42-bde1-28d38190e51f",
    "design"   : "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fdesign.jpg?alt=media&token=7a21a88f-9ecb-47e2-b3fe-be46ac6d5abf",
    "digital-arts"   : "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fdigital-arts.jpg?alt=media&token=a5fef389-34eb-4078-9aba-8353a5bd093a",
    "digital" :   "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fdigital.jpg?alt=media&token=04b47f73-f50b-4f47-a264-4b98563602c0",
    "disease"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fdisease.jpg?alt=media&token=d4c3e1b8-1530-4f9d-bed5-a66e13c30637",
    "earth"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fearth.jpg?alt=media&token=e18c3310-e8c2-4202-9da0-43df24f1cdb7",
    "ecology"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fecology.jpg?alt=media&token=5d1d52ad-3e23-429c-8bb9-924ea1328ab6",
    "economics" :   "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Feconomics.jpg?alt=media&token=91ca452b-6ca8-4a31-928a-ec56b8fcc1b0",
    "education"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Feducation.jpg?alt=media&token=be53de76-0d14-4b86-8652-5dc1e9adae78",
    "electrical-engineering"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Felectrical-engineering.jpg?alt=media&token=932b1a36-a7eb-49bd-923b-c4785da3836c",
    "engineering" :   "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fengineering.jpg?alt=media&token=fa5b33ec-4181-4386-b539-28e0151c49f4",
    "english"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fenglish.jpg?alt=media&token=40bed29e-cbd8-40a0-bf35-eeaf58818526",
    "environmental" :   "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fenvironmental.jpg?alt=media&token=d1b844ee-b3b2-4b32-a456-b9c008e04c61",
    "ethnic"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fethnic.jpg?alt=media&token=e3d8012d-8baa-4967-83d1-ab2a04bc7a2d",
    "feminist"   : "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Ffeminist.jpg?alt=media&token=cab59b2f-d864-4781-ab3e-3a02faf9f587",
    "film-studies"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Ffilm-studies.jpg?alt=media&token=6af218f0-5f74-464c-8dd5-f993ea282039",
    "finance" :   "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Ffinance.jpg?alt=media&token=d76c0336-97e9-4ba7-8c9e-46934354feb1",
    "food"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Ffood.jpg?alt=media&token=88bc49b0-4ad8-4223-9d62-9a2d987c53d8",
    "french"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Ffrench.jpg?alt=media&token=9983e13a-94c8-42a8-af17-e79017e1d235",
    "gender-studies"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fgender-studies.jpg?alt=media&token=23442f25-5c94-446d-8281-b13ecbcab0ec",
    "geography"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fgeography.jpg?alt=media&token=6124ae17-7d53-4fff-a9bb-6d08a1c84e1a",
    "geology"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fgeology.jpg?alt=media&token=ddadb68c-9e0b-4335-8b2e-59318f337d45",
    "german" :   "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fgerman.jpg?alt=media&token=c9072374-3505-4bd1-a14a-c0e85d357fe7",
    "health-studies" :   "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fhealth-studies.jpg?alt=media&token=571bbb4b-15ba-4dd4-ae78-b4e6175c0cf1",
    "history"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fhistory.jpg?alt=media&token=25ba2c18-3364-43e2-bf63-9e41ec9f4cfa",
    "human-biology"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fhuman-biology.jpg?alt=media&token=b8adf7f9-039b-4116-8061-9b39c6f93514",
    "human-physiology"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fhuman-physiology.jpg?alt=media&token=01ae953b-dbeb-4c8d-a140-1063211c49e1",
    "human"   : "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fhuman.jpg?alt=media&token=ba09cd4f-b085-493f-ad81-f0f13a628f12",
    "italian"   : "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fitalian.jpg?alt=media&token=973095cf-de9f-47d1-94a1-31ac0b57cb44",
    "japanese"   : "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fjapanese.jpg?alt=media&token=ac5e71d4-5241-4cf0-a219-0cf8c0688f97",
    "journalism"   : "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fjournalism.jpg?alt=media&token=7cbb99fc-5491-4ab6-8f62-f524c4181c44",
    "korean"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fkorean.jpg?alt=media&token=08985eee-45cc-4be0-b6f9-308560d2f886",
    "latin-america"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Flatin-america.jpg?alt=media&token=01b9f6c6-39a2-4818-b854-10ebdc19bb3c",
    "life-sciences" :   "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Flife-sciences.jpg?alt=media&token=46ed0c19-0e72-4285-ab4f-aec97e5580ee",
    "linguistics"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Flinguistics.jpg?alt=media&token=0042ca89-01cf-459c-a658-ff48c5d7d810",
    "literature"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fliterature.jpg?alt=media&token=8189a6bd-fa0e-48d9-91b3-0be419ead5d5",
    "management"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fmanagement.jpg?alt=media&token=dcfc9194-e025-4b4f-ab28-eb6125406626",
    "mandarin"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fmandarin.png?alt=media&token=3ae1dabe-21f6-44ad-8cb5-4adf5528d400",
    "materials"   : "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fmaterials.jpg?alt=media&token=33a18e72-1529-4983-af4a-0dac6c708a4f",
    "mathematics"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fmathematics.jpg?alt=media&token=9ed91464-a9a4-46dc-8725-bb72461b1ba5",
    "microbiology"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fmicrobiology.jpg?alt=media&token=18caed99-6797-4779-be15-7a4cf5c50ccb",
    "music"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fmusic.jpg?alt=media&token=2ba3028b-5dd6-4a28-ae44-1c04eecb64ad",
    "nano"   : "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fnano.jpg?alt=media&token=c807bd16-489d-4652-94e7-5fc517c0a3f7",
    "nuclear-engineering" :   "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fnuclear-engineering.jpg?alt=media&token=878d6c33-c482-483b-817d-f4bd0e21d737",
    "oceanography"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Foceanography.jpg?alt=media&token=85c553dc-3584-4654-a5e4-7089cbc324a6",
    "philosophy"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fphilosophy.jpg?alt=media&token=ecd9274c-2232-4c3b-a0d2-fa6dc907afae",
    "physics"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fphysics.jpg?alt=media&token=0a174903-c305-41fa-a686-892f68a5c9a1",
    "planetary-science"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fplanetary-science.jpg?alt=media&token=cc7c55cb-8ba6-4950-955e-101ddef70ecb",
    "planning" :   "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fplanning.jpg?alt=media&token=7cc93888-4c84-44e5-93aa-9b65a4aacce1",
    "political"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fpolitical.jpg?alt=media&token=5bd9aa9f-e485-471e-afb8-41f28050aacf",
    "portuguese" :   "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fportuguese.jpg?alt=media&token=669b985e-e71f-44b0-a819-4d4b456442e7",
    "psychology"   : "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fpsychology.jpg?alt=media&token=72ada343-92a4-40c0-b939-a4310a112c4a",
    "religion"   : "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Freligion.jpg?alt=media&token=3ae4314e-ae98-44af-9e62-a5ff1bdfcddc",
    "robotics" :   "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Frobotics.jpg?alt=media&token=2d06f9e7-badc-4863-b32a-448f3f53487e",
    "russian"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Frussian.jpg?alt=media&token=dc055f35-f2e7-4c92-8a57-eb543d687da9",
    "sign-language" :   "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fsign-language.jpg?alt=media&token=daed5175-a9b3-401b-a1c6-8e8a4d1435e4",
    "slavic"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fslavic.jpg?alt=media&token=5cce239f-e8f5-43e6-b373-df43653007f6",
    "sociology"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fsociology.jpg?alt=media&token=9d010a39-0e30-458e-8ad8-70a35af7b912",
    "spanish"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fspanish.jpg?alt=media&token=26931f1d-1816-41c7-b74c-6fd34381d5f0",
    "sports-medicine"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fsports-medicine.jpg?alt=media&token=583e86a4-d7f7-48cf-a6bd-3a7689f20ec0",
    "statistics" :   "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fstatistics.jpg?alt=media&token=e76dc355-bb76-42b9-8211-6c2af4ce4194",
    "structural" :   "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fstructural.jpg?alt=media&token=1ec98220-ded8-4cce-a663-2ca6664db499",
    "theater"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Ftheater.jpg?alt=media&token=553419a5-c595-41b7-9342-6da9bffb189a",
    "writing"  :  "https://firebasestorage.googleapis.com/v0/b/tutortree-68061.appspot.com/o/SubjectBackgrounds%2Fwriting.jpg?alt=media&token=431c9512-a375-456f-9292-47ce1dd6755d"
};


