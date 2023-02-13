
const fileLocationChange = async (event) => {
    fileLocationLoad(event.target.value);
};

const fileLocationSearch = async (event) => {
    const entryFileNode = document.getElementById('entry-file');
    const value = await askForFile('simple_ui');

    if (value && value.file_path) {
        entryFileNode.value = value.file_path;
        await fileLocationChange({ target: entryFileNode });
    } else {
        entryFileNode.value = ''
        await fileLocationChange({ target: entryFileNode });
    };
};

const showQRSettings = async (event) => {
    var img = document.getElementById("qr-preview");
    var imgBase64 = await getQRByteArrayAsBase64();
    var img_src = "data:image/png;base64, " + imgBase64;

    img.src = img_src;
    console.log(img.style.visibility)
    img.style.visibility = (img.style.visibility=='visible' ? 'hidden': 'visible');
    console.log(img.style.visibility)
}

const setupEvents = () => {
    // File location
    // document.getElementById('entry-file').addEventListener('input', fileLocationChange);
    document.getElementById('entry-file-search').addEventListener('click', fileLocationSearch);
    document.getElementById('entry-file-save').addEventListener('click', fileLocationSave);
    document.getElementById('entry-file-qr').addEventListener('click', showQRSettings);
};

// Add configurationGetters
const getEntryFile = () => (['filenames', document.getElementById('entry-file').value]);
const getTitle = () => (['ConfigurationName', document.getElementById('entry-title').value]);
const getVersion = () => (['ConfigurationVersion', document.getElementById('entry-version').value]);
const getDescription = () => (['ConfigurationDescription', document.getElementById('entry-description').value]);

configurationGetters.push(getEntryFile);
configurationGetters.push(getTitle);
configurationGetters.push(getVersion);
configurationGetters.push(getDescription);

// Add configurationSetters
const setEntryFile = (value) => {
    document.getElementById('entry-file').value = value;
};

const setTitle = (value) => {
    document.getElementById('entry-title').value = value;
};

const setVersion = (value) => {
    document.getElementById('entry-version').value = value;
};

const setDescription = (value) => {
    document.getElementById('entry-description').value = value;
};

configurationSetters['filenames'] = setEntryFile;
configurationSetters['ConfigurationName'] = setTitle;
configurationSetters['ConfigurationVersion'] = setVersion;
configurationSetters['ConfigurationDescription'] = setDescription;
