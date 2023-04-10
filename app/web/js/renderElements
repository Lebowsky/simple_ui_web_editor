const getRenderModalElement = (params) => {
    const value = getRenderParamsValue(params);
    const {type, name, text, options} = params;

    const renderElements = {
        text: `
            <label for="${name}">${text}</label>
            <input type="${type}" name="${name}" id="${name}" data-param-name="${name}" value="${value}">
            `,
        
        checkbox: `
            <div>
                <label for="${name}">${text}</label>
                <input type="${type}" name="${name}" id="${name}" data-param-name="${name}" ${value}>
            </div>
            `,

        select:`
            <label>${text}</label>
            <select data-param-name="${name}">
            ${getSelectOptions(params)}
            </select>
            `,

        elements: `
            <label onclick="showList(this)">${text}
                <i class="fa fa-angle-down" aria-hidden="true"></i>
            </label>
            <div class="list-wrap" style="display: none;">
                <ul class="list elements">No elements</ul>
            </div>
            `,

        handlers: `
            <label onclick="showList(this)">${text}
                <i class="fa fa-angle-down" aria-hidden="true"></i>
            </label>
            <div class="list-wrap" style="display: none;">
                <ul class="list handlers">No handlers</ul>
            </div>
            `,

        type:`
            <label>${text}</label>
            <select data-param-name="${name}" class="element-type">
            ${getSelectOptions(params)}
            </select>
            `
    }

    return renderElements[params.type]
}

const getRenderParamsValue = (params) => {
    return {
        text: params.value ? params.value : '',
        select: params.value ? params.value : '',
        checkbox: params.value == true ? 'checked' : ''
    }[params.type]
}

const getSelectOptions = (params) => {
    const {options, value} = params;
    if (options)
           return `${options.map(option => `<option value="${option}" ${option==value ? 'selected' : ''}>${option}</option>`)}`
}
