const askForFile = async (fileType) => {
    return await eel.ask_file(fileType)();
};