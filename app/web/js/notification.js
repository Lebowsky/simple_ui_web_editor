function notificate(text, type) {
    $.toast(text, {sticky: false, type: type});
    console.log(text)
};
