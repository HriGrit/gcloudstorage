document.getElementById("fetch").addEventListener("click", function () {
	fetch("/fetch")
		.then((response) => response.json())
		.then((imageUrls) => {
			const galleryContainer = document.getElementById("viewzone");
			imageUrls.forEach((url) => {
				const img = document.createElement("img");
				img.src = url;
				img.classList.add("gallery-image"); // Add any necessary classes
				galleryContainer.appendChild(img);
			});
		})
		.catch((error) => console.error("Error fetching images:", error));
});
