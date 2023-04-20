const getRenderModalElement = (params) => {
    const value = getRenderParamsValue(params);
    const {type, name, text} = params;

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

    return renderElements[type]
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

const getRenderListElement = (params) => {
    const {type, parentType, path, rowKey, items} = params;

    const renderElements = {
        element : `
            <div class="btn-group">
            <button class="btn-add" data-type="${type}" data-parent-type="${parentType}" data-path="${path}">Add</button>
            </div>
            ${getRowsListElement(items, rowKey)}
        `
    }

    return renderElements['element'];
}

const getRowsListElement = (items, rowKey) => {
    let html = ''
    
    Object.entries(items).forEach(item => {
        const [index, element] = item;

        if (typeof rowKey !== 'string')
            itemName = element[rowKey.filter(key => element[key])[0]];
        else
            itemName = element[rowKey]

        html += `
        <li class="list-item ${element.active ? 'active' : ''}" data-parent-type="${element.type}" data-type="${element.type}" data-path="${index}"
            <span class="item-name">${itemName}</span>
            <div class="item-btn">
                <span class="edit">edit</span>
                <span class="delete">delete</span>
            </div>
        </li>
    `
    }); 
    return html   
}