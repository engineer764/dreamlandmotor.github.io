/**
 * Dreamland Vehicle Photo Picker
 *
 * Camera / Gallery -> raw File -> preview
 *
 * This file does not upload anything.
 * vehicleService.js handles the Supabase upload.
 */

let selectedPhotoFile = null;
let selectedPhotoPreviewUrl = null;
let photoPickerInitialized = false;

function initPhotoPicker() {
    if (photoPickerInitialized) {
        return;
    }

    const cameraButton =
        document.getElementById('cameraPhotoBtn');

    const galleryButton =
        document.getElementById('galleryPhotoBtn');

    const cameraInput =
        document.getElementById('cameraPhotoInput');

    const galleryInput =
        document.getElementById('galleryPhotoInput');

    const preview =
        document.getElementById('photoPreview');

    const filename =
        document.getElementById('photoFilename');

    if (
        !cameraButton ||
        !galleryButton ||
        !cameraInput ||
        !galleryInput ||
        !preview
    ) {
        console.warn(
            'Dreamland Photo Picker: required elements were not found.'
        );

        return;
    }

    function handleSelectedFile(file) {
        if (!file) {
            return;
        }

        if (!file.type || !file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }

        const maxSize = 15 * 1024 * 1024;

        if (file.size > maxSize) {
            alert(
                'Photo is too large. Please select an image smaller than 15 MB.'
            );
            return;
        }

        selectedPhotoFile = file;

        if (selectedPhotoPreviewUrl) {
            URL.revokeObjectURL(
                selectedPhotoPreviewUrl
            );
        }

        selectedPhotoPreviewUrl =
            URL.createObjectURL(file);

        preview.src =
            selectedPhotoPreviewUrl;

        preview.hidden = false;

        if (filename) {
            filename.textContent =
                file.name || 'Photo selected';
        }

        console.log(
            'Dreamland Photo Picker: photo selected:',
            file.name,
            file.size,
            file.type
        );
    }

    /*
     * CAMERA
     */
    cameraButton.addEventListener(
        'click',
        function (event) {
            event.preventDefault();
            event.stopPropagation();

            console.log(
                'Dreamland Photo Picker: camera button clicked.'
            );

            cameraInput.click();
        }
    );

    /*
     * GALLERY
     */
    galleryButton.addEventListener(
        'click',
        function (event) {
            event.preventDefault();
            event.stopPropagation();

            console.log(
                'Dreamland Photo Picker: gallery button clicked.'
            );

            galleryInput.click();
        }
    );

    /*
     * CAMERA RESULT
     */
    cameraInput.addEventListener(
        'change',
        function () {
            const file =
                cameraInput.files &&
                cameraInput.files.length > 0
                    ? cameraInput.files[0]
                    : null;

            handleSelectedFile(file);

            cameraInput.value = '';
        }
    );

    /*
     * GALLERY RESULT
     */
    galleryInput.addEventListener(
        'change',
        function () {
            const file =
                galleryInput.files &&
                galleryInput.files.length > 0
                    ? galleryInput.files[0]
                    : null;

            handleSelectedFile(file);

            galleryInput.value = '';
        }
    );

    photoPickerInitialized = true;

    console.log(
        'Dreamland Photo Picker initialized successfully.'
    );
}


/*
 * Public API
 */

export function getSelectedPhoto() {
    return selectedPhotoFile;
}


export function hasSelectedPhoto() {
    return Boolean(selectedPhotoFile);
}


export function clearSelectedPhoto() {
    const preview =
        document.getElementById('photoPreview');

    const filename =
        document.getElementById('photoFilename');

    const cameraInput =
        document.getElementById('cameraPhotoInput');

    const galleryInput =
        document.getElementById('galleryPhotoInput');

    selectedPhotoFile = null;

    if (selectedPhotoPreviewUrl) {
        URL.revokeObjectURL(
            selectedPhotoPreviewUrl
        );

        selectedPhotoPreviewUrl = null;
    }

    if (preview) {
        preview.removeAttribute('src');
        preview.hidden = true;
    }

    if (filename) {
        filename.textContent =
            'No photo selected';
    }

    if (cameraInput) {
        cameraInput.value = '';
    }

    if (galleryInput) {
        galleryInput.value = '';
    }
}


/*
 * Factory used by admin.html
 */
export function createPhotoPicker() {
    initPhotoPicker();

    return {
        getFile() {
            return getSelectedPhoto();
        },

        hasFile() {
            return hasSelectedPhoto();
        },

        clear() {
            clearSelectedPhoto();
        }
    };
}/**
 * Dreamland Vehicle Photo Picker
 *
 * Camera / Gallery -> raw File -> preview
 *
 * This file does not upload anything.
 * vehicleService.js handles the Supabase upload.
 */

let selectedPhotoFile = null;
let selectedPhotoPreviewUrl = null;

function initPhotoPicker() {
    const cameraButton = document.getElementById('cameraPhotoBtn');
    const galleryButton = document.getElementById('galleryPhotoBtn');

    const cameraInput = document.getElementById('cameraPhotoInput');
    const galleryInput = document.getElementById('galleryPhotoInput');

    const preview = document.getElementById('photoPreview');
    const filename = document.getElementById('photoFilename');

    if (
        !cameraButton ||
        !galleryButton ||
        !cameraInput ||
        !galleryInput ||
        !preview
    ) {
        console.warn(
            'Dreamland Photo Picker: required elements were not found.'
        );

        return;
    }

    function handleSelectedFile(file) {
        if (!file) {
            return;
        }

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }

        const maxSize = 15 * 1024 * 1024;

        if (file.size > maxSize) {
            alert(
                'Photo is too large. Please select an image smaller than 15 MB.'
            );
            return;
        }

        selectedPhotoFile = file;

        if (selectedPhotoPreviewUrl) {
            URL.revokeObjectURL(selectedPhotoPreviewUrl);
        }

        selectedPhotoPreviewUrl = URL.createObjectURL(file);

        preview.src = selectedPhotoPreviewUrl;
        preview.hidden = false;

        if (filename) {
            filename.textContent =
                file.name || 'Photo selected';
        }
    }

    /*
     * CAMERA
     */
    cameraButton.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();

        cameraInput.click();
    });

    /*
     * GALLERY
     */
    galleryButton.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();

        galleryInput.click();
    });

    /*
     * CAMERA RESULT
     */
    cameraInput.addEventListener('change', function () {
        const file = cameraInput.files
            ? cameraInput.files[0]
            : null;

        handleSelectedFile(file);

        cameraInput.value = '';
    });

    /*
     * GALLERY RESULT
     */
    galleryInput.addEventListener('change', function () {
        const file = galleryInput.files
            ? galleryInput.files[0]
            : null;

        handleSelectedFile(file);

        galleryInput.value = '';
    });

    console.log(
        'Dreamland Photo Picker initialized successfully.'
    );
}


/*
 * Public API
 */

export function getSelectedPhoto() {
    return selectedPhotoFile;
}

export function hasSelectedPhoto() {
    return Boolean(selectedPhotoFile);
}

export function clearSelectedPhoto() {
    const preview =
        document.getElementById('photoPreview');

    const filename =
        document.getElementById('photoFilename');

    const cameraInput =
        document.getElementById('cameraPhotoInput');

    const galleryInput =
        document.getElementById('galleryPhotoInput');

    selectedPhotoFile = null;

    if (selectedPhotoPreviewUrl) {
        URL.revokeObjectURL(
            selectedPhotoPreviewUrl
        );

        selectedPhotoPreviewUrl = null;
    }

    if (preview) {
        preview.removeAttribute('src');
        preview.hidden = true;
    }

    if (filename) {
        filename.textContent =
            'No photo selected';
    }

    if (cameraInput) {
        cameraInput.value = '';
    }

    if (galleryInput) {
        galleryInput.value = '';
    }
}


/*
 * Also export the old-style factory so the existing
 * admin.html can use it if it already imports it.
 */
export function createPhotoPicker() {
    initPhotoPicker();

    return {
        getFile() {
            return getSelectedPhoto();
        },

        hasFile() {
            return hasSelectedPhoto();
        },

        clear() {
            clearSelectedPhoto();
        }
    };
}


