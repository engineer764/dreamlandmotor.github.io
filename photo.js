/**
 * Dreamland Vehicle Photo Picker
 *
 * Camera / Gallery → raw File → preview
 *
 * This module does NOT upload anything to Supabase.
 * vehicleService.js handles the upload.
 */

export function createPhotoPicker(options = {}) {
    const cameraButton = document.getElementById(
        options.cameraButtonId || 'cameraPhotoBtn'
    );

    const galleryButton = document.getElementById(
        options.galleryButtonId || 'galleryPhotoBtn'
    );

    const cameraInput = document.getElementById(
        options.cameraInputId || 'cameraPhotoInput'
    );

    const galleryInput = document.getElementById(
        options.galleryInputId || 'galleryPhotoInput'
    );

    const preview = document.getElementById(
        options.previewId || 'photoPreview'
    );

    const filename = document.getElementById(
        options.filenameId || 'photoFilename'
    );

    if (
        !cameraButton ||
        !galleryButton ||
        !cameraInput ||
        !galleryInput ||
        !preview
    ) {
        throw new Error(
            'Vehicle photo picker elements are missing from admin.html.'
        );
    }

    let selectedFile = null;
    let previewUrl = null;

    function handleFile(file) {
        if (!file) {
            return;
        }

        if (!file.type || !file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }

        // Maximum client-side photo size: 15 MB.
        const maxSize = 15 * 1024 * 1024;

        if (file.size > maxSize) {
            alert(
                'Photo is too large. Please select an image smaller than 15 MB.'
            );
            return;
        }

        selectedFile = file;

        // Release the previous preview URL.
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        // Create a temporary browser preview.
        previewUrl = URL.createObjectURL(file);

        preview.src = previewUrl;
        preview.hidden = false;

        if (filename) {
            filename.textContent = file.name || 'Photo selected';
        }
    }

    // Open device camera.
    cameraButton.addEventListener('click', () => {
        cameraInput.click();
    });

    // Open gallery/file picker.
    galleryButton.addEventListener('click', () => {
        galleryInput.click();
    });

    // Camera photo selected/taken.
    cameraInput.addEventListener('change', () => {
        handleFile(
            cameraInput.files && cameraInput.files[0]
        );

        // Allow the same photo to be selected again later.
        cameraInput.value = '';
    });

    // Gallery photo selected.
    galleryInput.addEventListener('change', () => {
        handleFile(
            galleryInput.files && galleryInput.files[0]
        );

        // Allow the same photo to be selected again later.
        galleryInput.value = '';
    });

    return {
        /**
         * Returns the raw File selected by the admin.
         */
        getFile() {
            return selectedFile;
        },

        /**
         * Returns true if a photo has been selected.
         */
        hasFile() {
            return Boolean(selectedFile);
        },

        /**
         * Clears the selected photo and preview.
         */
        clear() {
            selectedFile = null;

            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
                previewUrl = null;
            }

            preview.removeAttribute('src');
            preview.hidden = true;

            if (filename) {
                filename.textContent = 'No photo selected';
            }

            cameraInput.value = '';
            galleryInput.value = '';
        }
    };
}
