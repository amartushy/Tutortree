

function fetchSubjectsAndCourses(forSchool) {
    let coursesRef = database.collection("schools").doc(forSchool).collection("courses");
    const container = document.getElementById('course-selection-container');
    container.innerHTML = ''

    coursesRef.get().then(snapshot => {
        if (snapshot.empty) {
            console.log("No matching documents.");
            return;
        }
        
        let subjects = [];

        snapshot.forEach(doc => {
            let subjectTitle = doc.id;
            let subjectData = doc.data();

            let courses = [];

            for (let [courseCode, courseInfo] of Object.entries(subjectData)) {
                if (courseCode === "_metadata") {
                    continue; // Skip the metadata entry
                }

                let courseDict = courseInfo;
                let courseTitle = courseDict.title || "";

                if (courseDict.tutors && Object.keys(courseDict.tutors).length > 0) {
                    // Create a Course object with actual tutor data
                    let course = {
                        id: courseCode,
                        courseCode: courseCode,
                        courseTitle: courseTitle,
                        numTutors: Object.keys(courseDict.tutors).length,
                        subject: subjectTitle,
                        tutors: courseDict.tutors
                    };

                    courses.push(course);
                } else {
                    // Create a Course object with no tutors
                    let course = {
                        id: courseCode,
                        courseCode: courseCode,
                        courseTitle: courseTitle,
                        numTutors: 0, // Explicitly set numTutors to 0
                        subject: subjectTitle,
                        tutors: {} // No tutors available
                    };

                    courses.push(course);
                }
            }

            // Sort the courses by courseCode in ascending order
            courses.sort((a, b) => a.courseCode.localeCompare(b.courseCode));

            // Extract subjectImage from metadata if available
            let metadata = subjectData["_metadata"];
            let subjectImage = metadata ? metadata.subjectImage : ""; // Use a default or placeholder image if not available

            // Create a Subject object
            let subject = {
                id: subjectTitle,
                subjectTitle: subjectTitle,
                subjectImage: subjectImage,
                courses: courses
            };

            subjects.push(subject);
        });

        // Assuming you have a way to update the UI with subjects
        updateUIWithSubjects(subjects);
        

    }).catch(error => {
        console.log("Error getting documents: ", error);
    });
}




function updateUIWithSubjects(subjects) {
    const subjectsContainer = document.getElementById('subjects-container'); // Ensure this container exists in your HTML

    // Clear existing subjects content
    subjectsContainer.innerHTML = '';

    subjects.forEach(subject => {
        // Create subject result container
        let subjectResultContainer = createDOMElement('div', 'subject-result-container', '', subjectsContainer);

        // Upper div with subject title and chevron
        let subjectResultDiv = createDOMElement('div', 'subject-result-div', '', subjectResultContainer);
        createDOMElement('div', 'subject-text', subject.subjectTitle, subjectResultDiv);
        createDOMElement('div', 'subject-chevron', '', subjectResultDiv); // Use appropriate icon/text for chevron

        // Bottom section for listing courses
        let subjectResultCourses = createDOMElement('div', 'subject-result-courses', '', subjectResultContainer);

        subject.courses.forEach(course => {
            // For each course, create a div within the subject-result-courses container
            let courseDiv = createDOMElement('div', 'subject-result-course', '', subjectResultCourses);
            createDOMElement('div', 'subject-course-text', course.id, courseDiv )
            createDOMElement('div', 'subject-course-icon', '', courseDiv )

            attachCourseSelectionListener(courseDiv, course, subject)
        });

        // Add event listener to subjectResultDiv for toggling course list visibility
        subjectResultDiv.addEventListener('click', function() {
            // Toggle visibility of subjectResultCourses
            subjectResultCourses.style.display = subjectResultCourses.style.display === 'none' ? 'flex' : 'none';
            // Update chevron direction based on visibility, assuming '' is closed and '' is open
            let chevron = this.querySelector('.subject-chevron');
            chevron.innerHTML = subjectResultCourses.style.display === 'none' ? '' : '';

            // Toggle the class for subject-result-div-selected
            if (this.classList.contains('subject-result-div-selected')) {
                this.classList.remove('subject-result-div-selected');
            } else {
                this.classList.add('subject-result-div-selected');
            }
        });

        // Initially hide the courses list
        subjectResultCourses.style.display = 'none';
    });
}

function attachCourseSelectionListener(courseDiv, course, subject) {
    let courseIdentifier = `${subject.id}-${course.id}`;

    courseDiv.addEventListener('click', function() {
        // Check if the course is already selected to prevent re-adding
        if (!selectedCourses[courseIdentifier]) {
            // Add course to selectedCourses
            selectedCourses[courseIdentifier] = {
                subject: subject.id, 
                courseCode: course.courseCode,
                element: courseDiv // Assuming courseDiv is the element you want to toggle visibility for
            };

            // Optionally, provide visual feedback or log
            console.log(`Course added: ${course.courseCode}`);
            courseDiv.style.display = "none";

            // Update the course selection UI
            updateCourseSelectionUI();
        }
    });
}



function updateCourseSelectionUI() {
    const container = document.getElementById('course-selection-container');
    container.innerHTML = ''; // Clear existing content

    let groupedCourses = Object.values(selectedCourses).reduce((acc, course) => {
        // Group courses by subject
        (acc[course.subject] = acc[course.subject] || []).push(course);
        return acc;
    }, {});

    Object.entries(groupedCourses).forEach(([subject, courses]) => {
        let subjectDiv = createDOMElement('div', 'course-selection-div', '', container);
        createDOMElement('div', 'course-selection-header', subject, subjectDiv);

        let coursesSelected = createDOMElement('div', 'courses-selected', '', subjectDiv)

        courses.forEach(courseData => {
            let courseDiv = createDOMElement('div', 'course-selected', '', coursesSelected);
            createDOMElement('div', 'course-selected-text', courseData.courseCode, courseDiv);

            courseDiv.addEventListener('click', function() {
                delete selectedCourses[`${subject}-${courseData.courseCode}`]; // Use correct identifier
                if (courseData.element) {
                    courseData.element.style.display = ''; // Re-display the course in subject results
                }
                updateCourseSelectionUI(); // Refresh UI
            });

            let xMark = createDOMElement('div', 'course-selected-xmark', '', courseDiv);

        });
    });
}
