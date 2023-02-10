const loadConfiguration = (data) => {
    for (const [key, value] of Object.entries(data.ClientConfiguration)) {
        if (configurationSetters.hasOwnProperty(key)) {
            configurationSetters[key](value);
        };
    };
};

const _collectDataToExport = () => {
    return {
        ClientConfiguration: getCurrentConfiguration(),
    }
};
const fileLocationSave = async () => {
    const data = _collectDataToExport();
    filePath = document.getElementById('entry-file').value
    await eel.save_configuration(data, filePath)();
};

const fileLocationLoad = async (file_path) => {
    const data = await eel.load_configuration(file_path)();
    loadConfiguration(data);
};
