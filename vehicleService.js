/**
 * Dreamland Vehicle Photo Picker
 *
 * Handles only:
 *
 * Camera / Gallery
 *       ↓
 * raw browser File
 *       ↓
 * preview
 *
 * Supabase upload is handled by vehicleService.js.
 */

export function createPhotoPicker(options = {}) {
    const cameraButton =
        document.getElementById(
            options.cameraButtonId ||
            'cameraPhotoBtn'
        );

    const galleryButton =
        document.getElementById(
            options.galleryButtonId ||
            'galleryPhotoBtn'
        );

    const cameraInput =
        document.getElementById(
            options.cameraInputId ||
            'cameraPhotoInput'
        );

    const galleryInput =
        document.getElementById(
            options.galleryInputId ||
            'galleryPhotoInput'
        );

    const preview =
        document.getElementById(
            options.previewId ||
            'photoPreview'
        );

    const filename =
        document.getElementById(
            options.filenameId ||
            'photoFilename'
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

    function selectFile(file) {
        if (!file) {
            return;
        }

        if (
            !file.type ||
            !file.type.startsWith('image/')
        ) {
            alert(
                'Please select an image file.'
            );
            return;
        }

        const maxSize =
            15 * 1024 * 1024;

        if (file.size > maxSize) {
            alert(
                'Photo is too large. Please select an image smaller than 15 MB.'
            );
            return;
        }

        selectedFile = file;

        if (previewUrl) {
            URL.revokeObjectURL(
                previewUrl
            );
        }

        previewUrl =
            URL.createObjectURL(file);

        preview.src = previewUrl;
        preview.hidden = false;

        if (filename) {
            filename.textContent =
                file.name ||
                'Photo selected';
        }
    }

    cameraButton.addEventListener(
        'click',
        () => {
            cameraInput.click();
        }
    );

    galleryButton.addEventListener(
        'click',
        () => {
            galleryInput.click();
        }
    );

    cameraInput.addEventListener(
        'change',
        () => {
            selectFile(
                cameraInput.files &&
                cameraInput.files[0]
            );

            cameraInput.value = '';
        }
    );

    galleryInput.addEventListener(
        'change',
        () => {
            selectFile(
                galleryInput.files &&
                galleryInput.files[0]
            );

            galleryInput.value = '';
        }
    );

    return {

        getFile() {
            return selectedFile;
        },

        hasFile() {
            return Boolean(
                selectedFile
            );
        },

        clear() {
            selectedFile = null;

            if (previewUrl) {
                URL.revokeObjectURL(
                    previewUrl
                );

                previewUrl = null;
            }

            preview.removeAttribute(
                'src'
            );

            preview.hidden = true;

            if (filename) {
                filename.textContent =
                    'No photo selected';
            }

            cameraInput.value = '';
            galleryInput.value = '';
        }
    };
}
