/*
Handle configuration modifications
*/

const configurationGetters = []; // Each function in this should either return null or [option.dest, value]
const configurationSetters = {}; // dest: fn(value) => void, used to set option values
const configurationCleaners = []; // Each function in this should clear a dest value

const getCurrentConfiguration = () => {
    const currentConfiguration = {};

    configurationGetters.forEach(getter => {
        const optionValuePair = getter();
        currentConfiguration[optionValuePair[0]] = optionValuePair[1]
    });

    return currentConfiguration;
};