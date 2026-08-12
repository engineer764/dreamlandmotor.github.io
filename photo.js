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
let pickerInstance = null;


/*
 * Initialize the photo picker.
 */
function initPhotoPicker(options = {}) {

    if (pickerInstance) {
        return pickerInstance;
    }

    const cameraButtonId =
        options.cameraButtonId || 'cameraPhotoBtn';

    const galleryButtonId =
        options.galleryButtonId || 'galleryPhotoBtn';

    const cameraInputId =
        options.cameraInputId || 'cameraPhotoInput';

    const galleryInputId =
        options.galleryInputId || 'galleryPhotoInput';

    const previewId =
        options.previewId || 'photoPreview';

    const filenameId =
        options.filenameId || 'photoFilename';


    const cameraButton =
        document.getElementById(cameraButtonId);

    const galleryButton =
        document.getElementById(galleryButtonId);

    const cameraInput =
        document.getElementById(cameraInputId);

    const galleryInput =
        document.getElementById(galleryInputId);

    const preview =
        document.getElementById(previewId);

    const filename =
        document.getElementById(filenameId);


    if (
        !cameraButton ||
        !galleryButton ||
        !cameraInput ||
        !galleryInput ||
        !preview
    ) {
        throw new Error(
            'Dreamland Photo Picker could not find its required HTML elements.'
        );
    }


    function handleSelectedFile(file) {

        if (!file) {
            return;
        }


        if (
            !file.type ||
            !file.type.startsWith('image/')
        ) {
            alert('Please select an image file.');
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
    }


    /*
     * CAMERA
     */
    cameraButton.addEventListener(
        'click',
        function (event) {

            event.preventDefault();
            event.stopPropagation();

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
                cameraInput.files.length
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
                galleryInput.files.length
                    ? galleryInput.files[0]
                    : null;

            handleSelectedFile(file);

            galleryInput.value = '';
        }
    );


    pickerInstance = {

        getFile() {
            return selectedPhotoFile;
        },


        hasFile() {
            return Boolean(
                selectedPhotoFile
            );
        },


        clear() {

            selectedPhotoFile = null;


            if (selectedPhotoPreviewUrl) {

                URL.revokeObjectURL(
                    selectedPhotoPreviewUrl
                );

                selectedPhotoPreviewUrl = null;
            }


            if (preview) {

                preview.removeAttribute(
                    'src'
                );

                preview.hidden = true;
            }


            if (filename) {

                filename.textContent =
                    'No photo selected';
            }


            cameraInput.value = '';
            galleryInput.value = '';
        }
    };


    return pickerInstance;
}


/*
 * Public factory used by admin.html.
 */
export function createPhotoPicker(options = {}) {

    return initPhotoPicker(options);
}


/*
 * Optional direct API.
 */
export function getSelectedPhoto() {

    return selectedPhotoFile;
}


export function hasSelectedPhoto() {

    return Boolean(
        selectedPhotoFile
    );
}


export function clearSelectedPhoto() {

    if (pickerInstance) {

        pickerInstance.clear();
        return;
    }

    selectedPhotoFile = null;


    if (selectedPhotoPreviewUrl) {

        URL.revokeObjectURL(
            selectedPhotoPreviewUrl
        );

        selectedPhotoPreviewUrl = null;
    }
}
