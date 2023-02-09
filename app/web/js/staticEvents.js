
const fileLocationChange = async (event) => {
//    colourInput(event.target, false, true, false);
//    updateCurrentCommandDisplay();
};

const fileLocationSearch = async (event) => {
    const entryFileNode = document.getElementById('entry-file');
    const value = await askForFile('simple_ui');
    if (value !== null) {
        entryFileNode.value = value;
        await scriptLocationChange({ target: entryScriptNode });
    }
};

const setupEvents = () => {
    // File location
    document.getElementById('entry-file').addEventListener('input', fileLocationChange);
    document.getElementById('entry-file-search').addEventListener('click', fileLocationSearch);
};