function buildSchoolsTable() {
    const schoolsRef = database.collection('schools');
    return schoolsRef.get()
        .then(snapshot => {
            if (snapshot.empty) {
                console.log('No schools found.');
                return;
            }
            snapshot.forEach(doc => {
                const schoolData = doc.data();
                // Assuming the document ID is the shortened school name (like 'berkeley')
                const shortName = doc.id;
                const fullName = schoolData.title; // Assuming 'title' holds the full name of the school
                schoolLookupTable[shortName] = fullName;
                renderSchoolRow(schoolData);

            });
            console.log('School lookup table built:', schoolLookupTable);
        })
        .catch(error => {
            console.error("Error fetching schools: ", error);
        });
}

function renderSchoolRow(school) {
    const schoolsContainer = document.getElementById('schools-container');
    const schoolRow = createDOMElement('div', 'row-parent', '', schoolsContainer);

    let schoolInfo = createDOMElement('div', 'row-div-20', '', schoolRow);
    createDOMElement('img', 'school-icon', school.icon, schoolInfo);
    createDOMElement('div', 'row-text-20', school.title, schoolInfo);
    console.log(school.title)

    let subjectsDiv = createDOMElement('div', 'row-div-20', '', schoolRow);
    createDOMElement('div', 'row-text-20', school.numSubjects, subjectsDiv);

    let coursesDiv = createDOMElement('div', 'row-div-20', '', schoolRow);
    createDOMElement('div', 'row-text-20', school.numCourses, coursesDiv);
    
    let tutorsDiv = createDOMElement('div', 'row-div-20', '', schoolRow);
    createDOMElement('div', 'row-text-20', school.numTutors, tutorsDiv);

    let actionsDiv = createDOMElement('div', 'row-div-20', '', schoolRow);
}



//Helper functions
function getFullSchoolName(shortName) {
    if (schoolLookupTable.hasOwnProperty(shortName)) {
        return schoolLookupTable[shortName];
    } else {
        console.log('School not found for:', shortName);
        return shortName;
    }
}


const showSchoolModal = document.getElementById('show-school-modal')
const closeSchoolModal = document.getElementById('close-school-modal')
const schoolModal = document.getElementById('school-modal')

const schoolPhotoContainer = document.getElementById('school-photo-container')
const schoolPhotoButton = document.getElementById('school-photo-button')
const schoolIDField = document.getElementById('school-id-field')
const schoolTitleField = document.getElementById('school-title-field')
const uploadSubjectsTrigger = document.getElementById('upload-subjects-trigger')
const uploadSubjectsButton = document.getElementById('upload-subjects-button');

const submitNewSchoolButton = document.getElementById('submit-new-school-button')
const schoolSubjectsContainer = document.getElementById('school-subjects-container')

let globalSchoolSubjects = {};

document.addEventListener("DOMContentLoaded", function() {
    showSchoolModal.addEventListener('click', function() {
        schoolModal.style.display = 'flex'; // Show the modal
        resetSchoolModal()
    });

    closeSchoolModal.addEventListener('click', function() {
        schoolModal.style.display = 'none'; // Hide the modal
    });

    schoolPhotoButton.addEventListener('click', function() {
        uploadSchoolIcon()
    });

    uploadSubjectsTrigger.addEventListener('click', function() {
        uploadSubjectsButton.click()
    });
    
    uploadSubjectsButton.addEventListener('change', handleSubjectsUpload);


    submitNewSchoolButton.addEventListener('click', function() {
        const schoolID = schoolIDField.value;
        const schoolTitle = schoolTitleField.value;
        const schoolIconURL = schoolPhotoContainer.querySelector('img') ? schoolPhotoContainer.querySelector('img').src : '';

        if (!schoolID || !schoolTitle || !schoolIconURL) {
            alert('Please enter School ID, Title, and ensure an icon is uploaded');
            return;
        }

        saveSchoolDetails(schoolID, schoolTitle, schoolIconURL, globalSchoolSubjects);

        schoolModal.style.display = 'none';
    });

});

function saveSchoolDetails(schoolID, schoolTitle, schoolIconURL, schoolSubjects) {
    const schoolRef = database.collection('schools').doc(schoolID);

    schoolRef.set({
        title: schoolTitle,
        icon: schoolIconURL
    }).then(() => {
        console.log("School details saved successfully!");

        Object.keys(schoolSubjects).forEach(subject => {
            const subjectRef = schoolRef.collection('courses').doc(subject);
            let coursesData = {};

            Object.keys(schoolSubjects[subject]).forEach(courseCode => {
                if (courseCode !== "_metadata") {
                    const course = schoolSubjects[subject][courseCode];
                    coursesData[courseCode] = {
                        info: {title: course.info.title, numTutors: 0}
                    };
                }
            });

            subjectRef.set({
                ...coursesData,
                _metadata: schoolSubjects[subject]._metadata
            }).then(() => {
                console.log(`Courses for ${subject} saved successfully!`);
            }).catch(error => {
                console.error("Error saving courses:", error);
            });
        });
    }).catch(error => {
        console.error("Error saving school details:", error);
    });
}


function uploadSchoolIcon () {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;

        const storageRef = storage.ref(`schoolIcons/${file.name}`);

        const uploadTask = storageRef.put(file);

        uploadTask.on('state_changed',
            function(snapshot) {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            },
            function(error) {
                console.error('Upload failed:', error);
                alert('Error during file upload: ' + error.message);
            },
            function() {
                uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                    console.log('File available at', downloadURL);
                    schoolPhotoContainer.innerHTML = '';
                    let newIconButton = createDOMElement('img', 'add-school-icon-button', downloadURL, schoolPhotoContainer)
                    newIconButton.addEventListener('click', function() {
                        uploadSchoolIcon()
                    });
                });
            }
        );
    };
    fileInput.click();
}


function handleSubjectsUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        globalSchoolSubjects = parseCSVtoSubjects(text);
        buildSubjectButtons(globalSchoolSubjects);
    };
    reader.readAsText(file);
}

function parseCSVtoSubjects(csvText) {
    const rows = csvText.split('\n');
    const schoolSubjects = {};

    rows.forEach((row, index) => {
        if (index === 0 || row.trim() === '') return;
        const columns = row.split(',');

        const subject = columns[0].trim();
        const subjectImageKey = columns[1].trim();
        const courseCode = columns[2].trim();
        const courseTitle = columns[3].trim();

        if (!schoolSubjects[subject]) {
            schoolSubjects[subject] = {};
        }
        
        if (!schoolSubjects[subject][courseCode]) {
            schoolSubjects[subject][courseCode] = {
                info: {
                    title: courseTitle,
                    numTutors: 0
                }
            };
        }
        
        if (!schoolSubjects[subject]._metadata) {
            schoolSubjects[subject]._metadata = {
                subjectImage: subjectImageKey,
                subjectImageURL: subjectBackgrounds[subjectImageKey]
            };
        }
    });

    return schoolSubjects;
}

function buildSubjectButtons(schoolSubjects) {
    const subjectsContainer = document.getElementById('school-subjects-container');
    subjectsContainer.innerHTML = '';

    Object.keys(schoolSubjects).forEach(subject => {
        const subjectData = schoolSubjects[subject];
        const numCourses = Object.keys(subjectData).length - 1;
        const subjectImageURL = subjectData._metadata.subjectImageURL;
        
        const subjectParent = createDOMElement('div', 'subject-button', '', subjectsContainer);
        if (subjectImageURL) {
            subjectParent.style.backgroundImage = `linear-gradient(90deg, rgba(0,0,0,0.6), rgba(0,0,0,0.43)), url(${subjectImageURL})`;
            subjectParent.style.backgroundSize = 'cover';
            subjectParent.style.backgroundPosition = 'center';
        }
        const subjectInfo = createDOMElement('div', 'subject-info-text', '', subjectParent);
        createDOMElement('div', 'subject-header', subject, subjectInfo);
        createDOMElement('div', 'subject-subheader', `${numCourses} courses`, subjectInfo);
        createDOMElement('div', 'chevron-down', '', subjectParent);

        
    });
}


function resetSchoolModal() {
    schoolSubjectsContainer.innerHTML = ""
    schoolIDField.value = ""
    schoolTitleField.value = ""
    
    let globalSchoolSubjects = {};

}
