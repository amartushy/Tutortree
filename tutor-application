$(document).ready(function() {
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

    function switchSection(nextIndex) {
        $("#" + sections[currentSectionIndex]).fadeOut(300, function() {
            $(this).css('display', 'none');
            $("#" + sections[nextIndex]).css('display', 'flex').hide().fadeIn(300);
            currentSectionIndex = nextIndex;
            updateProgressBar(currentSectionIndex);
            updateButtonVisibility(currentSectionIndex);

        });
    }

		// Set initial states
    updateProgressBar(currentSectionIndex); 
    updateButtonVisibility(currentSectionIndex);

    $("#next-button").click(function() {
        if (currentSectionIndex < sections.length - 1) {
            switchSection(currentSectionIndex + 1);
        }
    });

    $("#back-button").click(function() {
        if (currentSectionIndex > 0) {
            switchSection(currentSectionIndex - 1);
        }
    });
});
