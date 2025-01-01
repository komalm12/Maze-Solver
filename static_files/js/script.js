// Wait for the DOM to fully load before attaching event listeners
document.addEventListener("DOMContentLoaded", () => {
    const mazeForm = document.getElementById("mazeForm");
    const status = document.getElementById("status");
    const mazeGif = document.getElementById("mazeGif");
    const fileInput = document.getElementById("mazeImage");
    const imagePreviewContainer = document.createElement("div");
    const imagePreview = document.createElement("img");
    const previewTitle = document.createElement("h3");
    const downloadButton = document.createElement("a");
    
    // Check if all necessary elements exist
    if (!mazeForm || !status || !mazeGif || !fileInput) {
        console.error("One or more required elements are missing in the DOM.");
        return;
    }

    // Add the image preview container to the DOM
    imagePreviewContainer.id = "imagePreviewContainer";
    previewTitle.textContent = "Uploaded Maze Preview:";
    previewTitle.style.display = "none"; // Initially hidden
    imagePreview.id = "imagePreview";
    imagePreview.style.display = "none"; // Initially hidden
    imagePreviewContainer.appendChild(previewTitle);
    imagePreviewContainer.appendChild(imagePreview);
    mazeForm.parentNode.insertBefore(imagePreviewContainer, mazeForm.nextSibling);

    // Configure the download button
    downloadButton.id = "downloadGifButton";
    downloadButton.textContent = "Download GIF";
    downloadButton.style.display = "none"; // Initially hidden
    downloadButton.style.marginTop = "20px";
    downloadButton.style.padding = "12px 25px";
    downloadButton.style.background = "linear-gradient(to right, #08f1de, hsl(172, 98%, 21%))";
    downloadButton.style.color = "#ffffff";
    downloadButton.style.fontSize = "1rem";
    downloadButton.style.fontWeight = "bold";
    downloadButton.style.textDecoration = "none";
    downloadButton.style.borderRadius = "20px";
    downloadButton.style.boxShadow = "0 5px 15px rgba(0, 0, 0, 0.2)";
    mazeForm.parentNode.insertBefore(downloadButton, imagePreviewContainer.nextSibling);

    // Add an input change listener to preview the uploaded image
    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();

            reader.onload = (event) => {
                imagePreview.src = event.target.result; // Set the image preview source
                imagePreview.style.display = "block";
                previewTitle.style.display = "block";
            };

            reader.readAsDataURL(file); // Read the uploaded file as a data URL
        } else {
            imagePreview.style.display = "none";
            previewTitle.style.display = "none";
        }
    });

    // Add a submit event listener to the form
    mazeForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Show processing status
        status.textContent = "Processing... Please wait.";
        mazeGif.style.display = "none";
        mazeGif.src = ""; // Clear the previous GIF
        downloadButton.style.display = "none"; // Hide the download button
        downloadButton.href = ""; // Clear the download link

        // Prepare form data
        const formData = new FormData();
        const file = fileInput.files[0];

        if (!file) {
            status.textContent = "Please upload a maze image.";
            return;
        }

        formData.append("mazeImage", file);

        try {
            // Send data to the server
            const response = await fetch("/solve_maze", {
                method: "POST",
                body: formData,
            });

            // Handle server response
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to process maze");
            }

            const result = await response.json();

            // Update UI with the result
            if (result.gifUrl) {
                status.textContent = "Maze solved! See the animation below.";
                mazeGif.src = result.gifUrl; // Set the correct URL for the GIF
                mazeGif.style.display = "block";

                // Configure the download button
                downloadButton.href = result.gifUrl;
                downloadButton.download = "solved_maze.gif"; // Set the filename for download
                downloadButton.style.display = "inline-block"; // Show the download button
            } else {
                throw new Error("No GIF URL returned by the server.");
            }
        } catch (error) {
            // Handle errors
            console.error("Error:", error);
            status.textContent = `Error: ${error.message}`;
        }
    });
});
