document.getElementById('transcript-upload-button').addEventListener('click', function() {
    document.getElementById('transcript-file-input').click(); // Trigger file selection
});

document.getElementById('transcript-file-input').addEventListener('change', function(e) {
    if (e.target.files.length > 0) {
        const file = e.target.files[0];
        showLoadingAnimation();
        uploadTranscript(file);
    }
});

function showLoadingAnimation() {
    const loadingAnim = document.getElementById('loading-animation');
    loadingAnim.classList.add('fade-in');
    loadingAnim.classList.remove('fade-out');
    loadingAnim.style.display = 'block'; // Show the loading animation
    lottie.loadAnimation({
        container: loadingAnim,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'path/to/loading-animation.json' // Path to your loading animation JSON
    });
}

function hideLoadingAnimation() {
    const loadingAnim = document.getElementById('loading-animation');
    loadingAnim.classList.add('fade-out');
    loadingAnim.classList.remove('fade-in');
    setTimeout(() => {
        loadingAnim.style.display = 'none'; // Hide the loading animation
    }, 500); // Corresponds to animation duration
}

function showDoneAnimation() {
    const doneAnim = document.getElementById('done-loading-animation');
    doneAnim.classList.add('fade-in');
    doneAnim.classList.remove('fade-out');
    doneAnim.style.display = 'block'; // Show the done animation
    lottie.loadAnimation({
        container: doneAnim,
        renderer: 'svg',
        loop: false,
        autoplay: true,
        path: 'path/to/done-animation.json' // Path to your done animation JSON
    });
}

function uploadTranscript(file) {
    const userId = firebase.auth().currentUser.uid; // Ensure the user is authenticated
    const transcriptRef = storage.ref(`transcripts/${userId}/${file.name}`);

    transcriptRef.put(file).then((snapshot) => {
        console.log('Uploaded a blob or file!');
        snapshot.ref.getDownloadURL().then((downloadURL) => {
            console.log('File available at', downloadURL);
            database.collection('users').doc(userId).update({
                transcriptURL: downloadURL
            }).then(() => {
                console.log('User document updated with transcript URL.');
                const transcriptTextElement = document.getElementById('transcript-file-text');
                transcriptTextElement.textContent = file.name;
                hideLoadingAnimation();
                showDoneAnimation();
                setTimeout(() => {
                    const doneAnim = document.getElementById('done-loading-animation');
                    doneAnim.classList.add('fade-out');
                    doneAnim.classList.remove('fade-in');
                    setTimeout(() => {
                        doneAnim.style.display = 'none'; // Hide the done animation after it plays
                    }, 500); // Corresponds to animation duration
                }, 3000); // Display done animation for 3 seconds before hiding
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
