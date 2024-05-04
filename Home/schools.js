


function buildSchoolsTable() {
    const schoolsRef = firebase.firestore().collection('schools');

    schoolsRef.get().then(snapshot => {
        if (snapshot.empty) {
            console.log('No schools found.');
            return;
        }

        snapshot.forEach(doc => {
            const school = doc.data();
            renderSchoolRow(school);
        });
    }).catch(error => {
        console.error("Error fetching schools: ", error);
    });
}


function renderSchoolRow(school) {
    const container = document.getElementById('schoolsContainer'); // Ensure this div exists in your HTML

    // Create a row for each school
    const row = document.createElement('div');
    row.className = 'school-row';

    // Icon
    const icon = document.createElement('img');
    icon.src = school.icon; // Make sure the icon URL is stored in the school document
    icon.className = 'school-icon';
    row.appendChild(icon);

    // Title
    const title = document.createElement('div');
    title.textContent = school.title;
    title.className = 'school-title';
    row.appendChild(title);

    // Number of Subjects
    const numSubjects = document.createElement('div');
    numSubjects.textContent = `Subjects: ${school.numSubjects}`;
    numSubjects.className = 'school-info';
    row.appendChild(numSubjects);

    // Number of Courses
    const numCourses = document.createElement('div');
    numCourses.textContent = `Courses: ${school.numCourses}`;
    numCourses.className = 'school-info';
    row.appendChild(numCourses);

    // Number of Tutors
    const numTutors = document.createElement('div');
    numTutors.textContent = `Tutors: ${school.numTutors}`;
    numTutors.className = 'school-info';
    row.appendChild(numTutors);

    container.appendChild(row);
}



//Helper functions
function getFullSchoolName(shortName) {
    if (schoolLookupTable.hasOwnProperty(shortName)) {
        return schoolLookupTable[shortName];
    } else {
        console.log('School not found for:', shortName);
        return shortName; // Return a default value or handle it as required
    }
}

function buildSchoolLookupTable() {
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
            });
            console.log('School lookup table built:', schoolLookupTable);
        })
        .catch(error => {
            console.error("Error fetching schools: ", error);
        });
}
