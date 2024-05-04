document.getElementById('transcript-upload-area').addEventListener('click', function() {
    document.getElementById('transcript-file-input').click(); // Trigger file selection
});

document.getElementById('transcript-file-input').addEventListener('change', function(event) {
    handleFiles(event.target.files); // Directly handle files from input
});

function handleFiles(files) {
    if (files.length > 0) {
        showLoadingAnimation();
        uploadTranscript(files[0]);
    }
}

const uploadArea = document.getElementById('transcript-upload-area');

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  uploadArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Highlight drop area when item is dragged over it
['dragenter', 'dragover'].forEach(eventName => {
  uploadArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
  uploadArea.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
    uploadArea.classList.add('dragover');
}

function unhighlight(e) {
    uploadArea.classList.remove('dragover');
}

// Handle dropped files
uploadArea.addEventListener('drop', function(event) {
    handleFiles(event.dataTransfer.files); // Handle files from drop
});


function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;

    handleFiles({dataTransfer: dt});
}

//Handle animations
function showLoadingAnimation() {
    const loadingAnim = document.getElementById('loading-animation');
    loadingAnim.style.display = 'block'; // Show the loading animation
}

function hideLoadingAnimation() {
    const loadingAnim = document.getElementById('loading-animation');
    loadingAnim.style.display = 'none'; // Hide the loading animation
}

function showDoneAnimation() {
    const doneAnim = document.getElementById('done-loading-animation');
    doneAnim.style.display = 'block'; // Show the done animation
    playLottieAnimation('done-loading-animation');

}

function playLottieAnimation(elementId) {
    const animationElement = document.getElementById(elementId);
    const lottieInstance = animationElement.lottie;
    lottieInstance.goToAndPlay(0); // Restart and play the animation from the beginning
}

function uploadTranscript(file) {
    const userId = firebase.auth().currentUser.uid; // Ensure the user is authenticated
    const transcriptRef = storage.ref(`transcripts/${userId}/${file.name}`);

    transcriptRef.put(file).then((snapshot) => {
        console.log('Uploaded a blob or file!');
        snapshot.ref.getDownloadURL().then((downloadURL) => {
            console.log('File available at', downloadURL);
            let transcriptFileName = downloadURL.split('/').pop();
            transcriptFileName = transcriptFileName.split('?')[0];
            transcriptFileText = decodeURIComponent(transcriptFileName);
            
            checkNextButtonConditions()

            database.collection('users').doc(userId).update({
                transcriptURL: downloadURL
            }).then(() => {
                console.log('User document updated with transcript URL.');
                const transcriptTextElement = document.getElementById('transcript-file-text');
                transcriptTextElement.textContent = file.name;
                hideLoadingAnimation();
                showDoneAnimation();
                
            }).catch((error) => {
                console.error('Error updating user document:', error);
                hideLoadingAnimation();
            });
        });
    }).catch((error) => {
        console.error('Error uploading file:', error);
        hideLoadingAnimation();
    });
}
