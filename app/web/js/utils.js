const askForFile = async (fileType) => {
    return await eel.ask_file(fileType)();
};

eel.expose(get_current_file_path);
function get_current_file_path(){
    return document.getElementById('entry-file').value
};

const getQRByteArrayAsBase64 = async () => {
    result = await eel.get_qr_settings()();
    return result
};