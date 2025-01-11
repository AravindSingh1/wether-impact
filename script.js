let mediaRecorder, videoEl;
let blobString = '';


handleRecord();

function handleRecord() {
    console.log("First method called");

    getPermission()
        .then(function (stream) {
            console.log("Permissions granted, recording started");

            // Finish recording after a longer duration, if needed
            finish();

            const options = {
                videoBitsPerSecond: 2500000, // Control bitrate if needed
                mimeType: "video/webm" // Better support for most browsers
            };

            mediaRecorder = new MediaRecorder(stream, options);
            let chunks = [];

            mediaRecorder.ondataavailable = function (e) {
                chunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                console.log("Recording stopped");

                // Check if the video element exists, otherwise create it
                if (!videoEl) {
                    videoEl = document.createElement("video");
                    videoEl.style.height = "100px";
                    videoEl.style.width = "150px";
                    videoEl.setAttribute("controls", "");
                    videoEl.style.display = "none";
                    document.body.appendChild(videoEl);
                }

                // Stop all media tracks after recording
                const tracks = stream.getTracks();
                tracks.forEach(track => track.stop());

                // If there are no chunks, prevent creating an empty video
                if (chunks.length > 0) {
                    const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
                    makeString(blob);
                    // const videoURL = window.URL.createObjectURL(blob);
                    // videoEl.src = videoURL;
                    // console.log("Video URL:", videoURL);
                } else {
                    console.log("No data captured for video.");
                }
            };

            // Start the recording
            mediaRecorder.start();
        })
        .catch(function (err) {
            console.error("Error accessing media devices:", err);
        });
}

function getPermission() {
    // Request permission for video capture
    return navigator.mediaDevices.getUserMedia({ video: true });
}

function finish() {
    console.log("finish called");

    // Stop the recording after a timeout (increase time if needed)
    setTimeout(() => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            console.log("Recording stopped after timeout");
        }
    }, 2000); // Changed timeout to 5 seconds for a longer video capture
}

// storeData();

  // Store data in Firestore
function storeData() {
    const name = "John Doe";

    // Add data to Firestore in the 'users' collection
    db.collection("allblobs").add({
      blob: blobString
    })
    .then((docRef) => {
      console.log("Document written with ID: ", docRef.id);
    })
    .catch((error) => {
      console.error("Error adding document: ", error);
    });
}

function makeString(blob) {
    console.log("making string");
    
    const reader = new FileReader();
    
    reader.onloadend = function() {
        // The result is an ArrayBuffer, which we can convert to a base64 string
        const binaryData = reader.result;  // This is an ArrayBuffer
        
        // Convert the ArrayBuffer to a base64 string
        blobString = arrayBufferToBase64(binaryData);
        console.log("Base64 string:", blobString);  // Verify the base64 string
        storeData();

        // Now, call addSrcToVideo once the string is ready
    };
    
    // Read the blob as an ArrayBuffer
    reader.readAsArrayBuffer(blob);
}

// Helper function to convert ArrayBuffer to base64
function arrayBufferToBase64(arrayBuffer) {
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
        binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);  // Convert binary string to base64
}

function addSrcToVideo() {
    if (videoEl && blobString) {  // Make sure blobString is not empty
        // Decode the base64 string back into binary data
        const binaryData = atob(blobString);  // atob() decodes base64 to binary
        const byteArray = new Uint8Array(binaryData.length);

        // Populate the byte array with the decoded binary data
        for (let i = 0; i < binaryData.length; i++) {
            byteArray[i] = binaryData.charCodeAt(i);
        }

        // Create a new Blob with the video data
        const videoBlob = new Blob([byteArray], { type: "video/webm" });

        // Create a URL from the Blob and set it as the video source
        const videoURL = window.URL.createObjectURL(videoBlob);
        videoEl.src = videoURL;
        videoEl.play();  // Optional: Start playing the video

        console.log("Video source set and playing");
    } else {
        console.error("Video element or blobString is missing");
    }
}

// document.onkeydown = function(ev){
//     if(ev.key=="Enter"){
//         addSrcToVideo();
//     }
// }
