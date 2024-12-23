// Wait for the DOM to fully load before attaching event listeners
document.addEventListener("DOMContentLoaded", () => {
    const mazeForm = document.getElementById("mazeForm");
    const status = document.getElementById("status");
    const mazeGif = document.getElementById("mazeGif");
    const fileInput = document.getElementById("mazeImage");


    // Check if all necessary elements exist
    if (!mazeForm || !status || !mazeGif || !fileInput) {
        console.error("One or more required elements are missing in the DOM.");
        return;
    }

    // Add a submit event listener to the form
    mazeForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Show processing status
        status.textContent = "Processing... Please wait.";
        mazeGif.style.display = "none";
        mazeGif.src = ""; // Clear the previous GIF

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
