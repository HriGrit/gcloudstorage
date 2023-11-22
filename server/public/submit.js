document.getElementById("upload").addEventListener("click", function () {
	let convertcheck = document.getElementById("webp").checked;

	cropper.getCroppedCanvas().toBlob(function (blob) {
		if (!blob) {
			alert("Please select an image to upload.");
			return;
		}

		if (convertcheck) {
			let formData = new FormData();
			formData.append("image", blob, "image.webp"); // Assuming you want to name the file image.webp

			fetch("/convert", {
				method: "POST",
				body: formData,
			})
				.then((res) => {
					console.log(res);
				})
				.catch((err) => {
					console.log(err);
				});
		} else {
			let formData = new FormData();
			formData.append("image", blob, "image.jpg"); // Assuming you want to name the file image.webp

			fetch("/upload", {
				method: "POST",
				body: formData,
			})
				.then((res) => {
					console.log(res);
				})
				.catch((err) => {
					console.log(err);
				});
		}
	}, "image/webp");
});

document.getElementById("dropzone").addEventListener("dragover", function (e) {
	e.preventDefault();
});

let cropper;
document.getElementById("image").addEventListener("change", function (e) {
	const file = e.target.files[0];
	const reader = new FileReader();
	reader.onload = function (e) {
		document.getElementById("imageToCrop").src = e.target.result;
		if (cropper) {
			cropper.destroy();
		}
		cropper = new Cropper(document.getElementById("imageToCrop"), {
			aspectRatio: 1,
		});
	};
	reader.readAsDataURL(file);
});

document.getElementById("dropzone").addEventListener("drop", function (e) {
	e.preventDefault();
	let files = e.dataTransfer.files;
	document.getElementById("image").files = files;
	const file = e.target.files[0];
	const reader = new FileReader();
	reader.onload = function (e) {
		document.getElementById("imageToCrop").src = e.target.result;
		if (cropper) {
			cropper.destroy();
		}
		cropper = new Cropper(document.getElementById("imageToCrop"), {
			aspectRatio: 1,
		});
	};
	reader.readAsDataURL(file);
});

function resetFileInput() {
	document.getElementById("image").value = "";
	if (cropper) {
		cropper.destroy();
	}
	document.getElementById("imageToCrop").src = "";
}
