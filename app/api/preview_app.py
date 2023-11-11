import json
import os
import pathlib
from string import Formatter
from types import LambdaType

from uiweb import Simple, bs4, uuid, threading, SOCKET_NAMESPACE, html

from ..ui import get_current_file_path
from ..config import get_resource_path


class AsyncSimple(Simple):
    def __init__(self, socket, templates, python_modules=None):
        super().__init__(socket, '')
        self.templates = templates
        self.html = None
        self.load_settings(get_resource_path('web_settings.json'))

        if python_modules:
            for name in python_modules:
                path_to_handlers = get_resource_path(f'{name}.py')
                if os.path.exists(path_to_handlers):
                    print(f'{name} update')
                    module = __import__(name)
                    import importlib
                    importlib.reload(module)

    async def get_preview_page(self, request=''):

        file_path = await get_current_file_path()

        with open(file_path, encoding='utf-8') as file:
            self.configuration = json.load(file)

        menu_context = []
        for process in self.configuration['ClientConfiguration']['Processes']:
            if process.get("type") == "Process" and str(process.get('hidden', 'false')).lower() == 'false':
                menu_context.append(
                    {
                        'href': 'javascript:void(0)',
                        'caption': process.get("ProcessName")
                    }
                )

        content = self.templates.TemplateResponse("preview/preview.html", {"request": request, 'menu': menu_context})
        self.html = HTMLCreator(content.body)

        return content

    async def connect_event(self, message):
        if 'CommonHandlers' in self.configuration.get('ClientConfiguration', {}):
            common_handlers = self.configuration['ClientConfiguration'].get('CommonHandlers', [])

            json_str = {
                # "process": self.process.get("ProcessName", ""),
                # "operation": self.screen.get("Name", ""),
                "hashmap": self.hashMap}

            for handler in common_handlers:
                if handler.get('event') == 'onLaunch':
                    if handler.get('action') == 'run':
                        if handler.get('type') == 'python':
                            operation = handler.get('method')
                            self.set_input(operation, json.dumps(json_str, ensure_ascii=False).encode('utf-8'),
                                           self.process_data)

                        if handler.get('type') == 'online':
                            operation = handler.get('method')
                            self.set_input_online(operation, json.dumps(json_str, ensure_ascii=False))

                    elif handler.get('action') == 'runasync':
                        if handler.get('type') == 'python':
                            operation = handler.get('method')

                            _thread = threading.Thread(target=self.async_callback, args=(
                                operation, json_str, self.current_tab_id, handler.get('postExecute', '')))
                            _thread.start()

                        if handler.get('type') == 'online':
                            operation = handler.get('method')

                            _thread = threading.Thread(target=self.async_callback_online, args=(
                                operation, json_str, self.current_tab_id, handler.get('postExecute', '')))
                            _thread.start()

        if len(self.hashMap.get("ErrorMessage", "")) > 0:
            print(self.hashMap.get("ErrorMessage", ""))
            await self.socket_.emit('error', {'code': self.hashMap.get("ErrorMessage", "")}, room=self.sid,
                                    namespace='/' + SOCKET_NAMESPACE)

        try:
            await self.handle_command()
        except Exception as e:
            await self.socket_.emit('error', {'code': str(e)}, room=self.sid, namespace='/' + SOCKET_NAMESPACE)
            print(e)

    async def run_process(self, message):
        self.process_data = {}
        str_process_name = message.strip()

        if self.menutemplate:
            menu_item = next((item for item in self.menutemplate if item["caption"] == str_process_name), None)
            if menu_item is None:
                return
            else:
                process_name = menu_item.get("process")
        else:
            process_name = str_process_name

        self.hashMap = {}

        soup = bs4.BeautifulSoup(features="lxml")
        tab_id = str(uuid.uuid4().hex)
        self.current_tab_id = tab_id

        self.tabsHashMap[self.current_tab_id] = dict(self.hashMap)

        self.added_tables = []
        self.firsttabslayout = []
        button, tab = await self.new_screen_tab(self.configuration, process_name, '', soup, tab_id)

        await self.socket_.emit('add_html', {"id": "maintabs", "code": str(button)}, namespace='/simpleweb')
        await self.socket_.emit('add_html', {"id": "maincontainer", "code": str(tab)}, namespace='/simpleweb')
        await self.socket_.emit('click_button', {"id": "maintab_" + tab_id}, namespace='/simpleweb')

        for t in self.added_tables:
            await self.socket_.emit('run_datatable', t, namespace='/simpleweb')

        for t in self.firsttabslayout:
            await self.socket_.emit('click_button', {"id": t}, namespace='/simpleweb')

    async def new_screen_tab(self, configuration, processname, screenname, soup, tabid, title=None):
        openclick = "openTab(event, '" + tabid + "')"
        newTab = soup.new_tag("button", id="maintab_" + tabid, **{'class': 'tablinks'}, onclick=openclick)
        if title is None:
            newTab.string = processname
        else:
            newTab.string = title

        maintabs = soup.find(id="maintabs")
        if maintabs:
            maintabs.append(newTab)

        new_tab_content = soup.new_tag("div", id=tabid, **{'class': 'tabcontent'})

        new_container = soup.new_tag("div", style="display: flex;flex:auto;flex-direction:column;align-items:flex-end;")
        new_span = soup.new_tag("span", id="spanmaintab_" + tabid, **{'class': 'topright'})
        new_span.string = html.unescape('&#9746;')
        new_container.append(new_span)

        new_tab_content.append(new_container)

        new_element = soup.new_tag("div", id="root_" + tabid, **{'class': 'container-vertical'},
                                   style="height:100%;width:100%;")

        self.process = self.get_process(configuration, processname)
        self.screen = self.get_screen(self.process, screenname)

        self.tabs[tabid] = self.screen

        await self.RunEvent("onStart")

        layots = self.get_layouts(soup, self.screen, 0)
        new_element.append(layots)

        new_tab_content.append(new_element)

        main = soup.find(id="maincontainer")
        if main:
            main.append(new_tab_content)

        new_tag = soup.new_tag("script")
        new_tag.string = 'document.getElementById("' + "maintab_" + tabid + '").click();'
        soup.append(new_tag)

        return newTab, new_tab_content

    def get_layouts(self, soup, root, level, var_prefix='', localData=None):
        currentcontainer = bs4.BeautifulSoup(features="lxml")

        for elem in root['Elements']:
            tvkey = elem.get("Variable")
            if tvkey == None or tvkey == '':
                tvkey = ''

            tvkey = var_prefix + "d" + self.current_tab_id + "_" + tvkey

            # if orientation=="vertical":
            #           new_column = list()

            if elem.get('type') == 'LinearLayout' or elem.get('type') == 'Tabs' or elem.get('type') == 'Tab':

                styles = []

                if "BackgroundColor" in elem:
                    if len(elem.get("BackgroundColor", "")) > 0:
                        styles.append("background-color:" + elem.get("BackgroundColor"))

                if "StrokeWidth" in elem:
                    if len(elem.get("StrokeWidth", "")) > 0:
                        styles.append("border:" + str(elem.get("StrokeWidth")) + "px solid #242222;")

                if "Padding" in elem:
                    if len(elem.get("Padding", "")) > 0:
                        styles.append("padding:" + str(elem.get("Padding")) + "px;")

                if elem.get('type') == 'LinearLayout':

                    if elem.get("orientation") == 'horizontal':
                        if "gravity_horizontal" in elem:
                            if elem.get("gravity_horizontal") == 'center':
                                styles.append("justify-content:center;")
                            elif elem.get("gravity_horizontal") == 'left':
                                styles.append("justify-content:flex-start;")
                            elif elem.get("gravity_horizontal") == 'right':
                                styles.append("justify-content:flex-end;")
                        if "gravity_vertical" in elem:
                            if elem.get("gravity_vertical") == 'center':
                                styles.append("align-items:center;")
                            elif elem.get("gravity_vertical") == 'top':
                                styles.append("align-items:flex-start;")
                            elif elem.get("gravity_vertical") == 'bottom':
                                styles.append("align-items:flex-end;")

                        if "width" in elem:
                            if str(elem.get("width", "")).isnumeric():
                                styles.append("flex:" + str(elem.get("width")) + "px;")
                            elif elem.get("width", "") == "match_parent":
                                if str(elem.get("weight", "")) == "0":
                                    styles.append("flex:1;")
                                elif len(elem.get("weight", "")) > 0:
                                    styles.append("flex:" + elem.get("weight", "") + ";")

                        if "height" in elem:
                            if str(elem.get("height", "")).isnumeric():
                                styles.append("height:" + str(elem.get("height")) + "px;")
                            elif elem.get("height", "") == "match_parent":
                                styles.append("height:100%;")
                    else:

                        if "gravity_vertical" in elem:
                            if elem.get("gravity_vertical") == 'center':
                                styles.append("justify-content:center;")
                            elif elem.get("gravity_vertical") == 'top':
                                styles.append("justify-content:flex-start;")
                            elif elem.get("gravity_vertical") == 'bottom':
                                styles.append("justify-content:flex-end;")
                        if "gravity_horizontal" in elem:
                            if elem.get("gravity_horizontal") == 'center':
                                styles.append("align-items:center;")
                            elif elem.get("gravity_horizontal") == 'left':
                                styles.append("align-items:flex-start;")
                            elif elem.get("gravity_horizontal") == 'right':
                                styles.append("align-items:flex-end;")

                        if "height" in elem:
                            if str(elem.get("height", "")).isnumeric():
                                styles.append("flex:" + str(elem.get("height")) + "px;")
                            elif elem.get("height", "") == "match_parent":
                                if str(elem.get("weight", "")) == "0":
                                    styles.append("flex:1;")
                                elif len(elem.get("weight", "")) > 0:
                                    styles.append("flex:" + elem.get("weight", "") + ";")
                        if "width" in elem:
                            if str(elem.get("width", "")).isnumeric():
                                styles.append("width:" + str(elem.get("width")) + "px;")
                            elif elem.get("width", "") == "match_parent":
                                styles.append("width:100%;")

                if elem.get('type') == 'Tab':
                    styles.append("width:100%;")
                    styles.append("height:100%;")

                stylestr = ";".join(styles)

                if elem.get('type') == 'LinearLayout':
                    if elem.get("orientation") == 'horizontal':
                        new_element = soup.new_tag("div", **{'class': 'container-horizontal'}, style=stylestr)
                        currentcontainer.append(new_element)
                    else:
                        new_element = soup.new_tag("div", **{'class': 'container-vertical'}, style=stylestr)
                        currentcontainer.append(new_element)

                    layouts = self.get_layouts(soup, elem, level + 1, var_prefix, localData)

                    if 'style_class' in elem:
                        new_element['class'] = new_element.get('class', []) + [elem.get('style_class')]

                    new_element.append(layouts)
                elif elem.get('type') == 'Tabs':
                    new_element = soup.new_tag("div", **{'class': 'tab'}, style=stylestr,
                                               id="d" + self.current_tab_id + elem.get("Variable", "defaulttabs"))
                    i = 1
                    fortab = ""
                    for item in elem['Elements']:
                        idtab = item.get("Variable", "")
                        if len(idtab) > 0:
                            idtab = "d" + self.current_tab_id + idtab
                            # button = soup.new_tag("button",   **{'class':'tablinks'},style=stylestr,onclick="openTabLayout("+idtab+",event, '"+elem.get("Variable")+"_content_"+idtab+"')")
                            button = soup.new_tag("button", **{'class': 'tablinks'}, style=stylestr,
                                                  onclick="openTabLayout('" + "d" + self.current_tab_id + elem.get(
                                                      "Variable", "defaulttabs") + "',event, '" + idtab + "')",
                                                  id=elem.get("Variable") + "_btn_" + idtab)
                            if i == 1:
                                fortab = elem.get("Variable") + "_btn_" + idtab
                                self.firsttabslayout.append(fortab)
                            button.string = item.get("Variable", "defaulttabs")
                            i += 1
                            new_element.append(button)

                    if 'style_class' in elem:
                        new_element['class'] = new_element.get('class', []) + [elem.get('style_class')]

                    currentcontainer.append(new_element)

                    layouts = self.get_layouts(soup, elem, level + 1, var_prefix, localData)
                    currentcontainer.append(layouts)

                elif elem.get('type') == 'Tab':
                    idtab = elem.get("Variable", "")
                    if len(idtab) > 0:
                        idtab = "d" + self.current_tab_id + idtab
                        new_element = soup.new_tag("div", **{'class': 'tabcontentlayout'}, style=stylestr, id=idtab)

                        if 'style_class' in elem:
                            new_element['class'] = new_element.get('class', []) + [elem.get('style_class')]

                        layouts = self.get_layouts(soup, elem, level + 1, var_prefix, localData)
                        new_element.append(layouts)

                        currentcontainer.append(new_element)

                        # new_tag = soup.new_tag("script" )
                        # new_tag.string = 'document.getElementById("'+var_prefix+'").click();'
                        # currentcontainer.append(new_tag)

            else:

                if elem.get('type') == 'TextView':

                    new_element = soup.new_tag("p", id=tvkey, style=self.get_decor(elem))

                    new_element.string = html.unescape(self.calculateField(elem.get("Value"), localData))

                    if 'style_class' in elem:
                        new_element['class'] = new_element.get('class', []) + [elem.get('style_class')]

                    if "#" in str(self.calculateField(elem.get("Value"), localData)):
                        new_element['class'] = new_element.get('class', []) + ['fa']

                    currentcontainer.append(new_element)

                if elem.get('type') == 'EditTextText':

                    # new_form = soup.new_tag("form", method="post", action="/oninput/")

                    new_element = soup.new_tag("input", id=tvkey, type="text", style=self.get_decor(elem))
                    if len(elem.get("Value", '')) > 0:
                        new_element = soup.new_tag("input", id=tvkey, type="text",
                                                   value=self.calculateField(elem.get("Value"), localData),
                                                   style=self.get_decor(elem))

                    # new_form.append(new_element)
                    currentcontainer.append(new_element)

                if elem.get('type') == 'EditTextAuto':

                    # new_form = soup.new_tag("form", method="post", action="/oninput/")

                    new_element = soup.new_tag("input", id=tvkey, type="text", style=self.get_decor(elem),
                                               **{'class': 'autotext'})
                    if len(elem.get("Value", '')) > 0:
                        new_element = soup.new_tag("input", id=tvkey, type="text",
                                                   value=self.calculateField(elem.get("Value"), localData),
                                                   **{'class': 'autotext'}, style=self.get_decor(elem))

                    if 'style_class' in elem:
                        new_element['class'] = new_element.get('class', []) + [elem.get('style_class')]

                    # new_form.append(new_element)
                    currentcontainer.append(new_element)

                if elem.get('type') == 'EditTextNumeric':

                    step = "any"
                    placeholder = "0."

                    if int(elem.get('NumberPrecision', '-1')) >= 0:
                        if int(elem.get('NumberPrecision', '-1')) == 0:
                            step = "1"
                        else:
                            step = "."
                            for i in range(1, int(elem.get('NumberPrecision', '-1'))):
                                step += "0"
                                placeholder += "0"

                            step += "1"
                            placeholder += "0"

                    new_element = soup.new_tag("input", id=tvkey, type="number", style=self.get_decor(elem),
                                               onkeypress="return isNumberKey(event)", step=step,
                                               placeholder=placeholder)
                    if len(elem.get("Value", '')) > 0:
                        new_element = soup.new_tag("input", id=tvkey, type="number",
                                                   value=self.calculateField(elem.get("Value"), localData), step=step,
                                                   placeholder=placeholder, style=self.get_decor(elem))

                    if 'style_class' in elem:
                        new_element['class'] = new_element.get('class', []) + [elem.get('style_class')]

                    currentcontainer.append(new_element)

                if elem.get('type') == 'EditTextPass':

                    # new_form = soup.new_tag("form", method="post", action="/oninput/")

                    new_element = soup.new_tag("input", id=tvkey, type="password", style=self.get_decor(elem))
                    if len(elem.get("Value", '')) > 0:
                        new_element = soup.new_tag("input", id=tvkey, type="password",
                                                   value=self.calculateField(elem.get("Value"), localData),
                                                   style=self.get_decor(elem))

                    if 'style_class' in elem:
                        new_element['class'] = new_element.get('class', []) + [elem.get('style_class')]

                    # new_form.append(new_element)
                    currentcontainer.append(new_element)

                if elem.get('type') == 'MultilineText':

                    # new_form = soup.new_tag("form", method="post", action="/oninput/")

                    new_element = soup.new_tag("textarea", id=tvkey, style=self.get_decor(elem))
                    if len(elem.get("Value", '')) > 0:
                        new_element.string = self.calculateField(elem.get("Value"), localData)

                    if 'style_class' in elem:
                        new_element['class'] = new_element.get('class', []) + [elem.get('style_class')]

                    # new_form.append(new_element)
                    currentcontainer.append(new_element)

                if elem.get('type') == 'file':

                    # new_form = soup.new_tag("form", method="post", action="/oninput/")

                    new_element = soup.new_tag("input", id=tvkey, type="file", style=self.get_decor(elem))
                    if len(elem.get("Value", '')) > 0:
                        new_element = soup.new_tag("input", id=tvkey, type="file",
                                                   value=self.calculateField(elem.get("Value"), localData),
                                                   style=self.get_decor(elem))

                    # new_form.append(new_element)
                    currentcontainer.append(new_element)

                if elem.get('type') == 'DateField':

                    # new_form = soup.new_tag("form", method="post", action="/oninput/")

                    new_element = soup.new_tag("input", id=tvkey, type="date", style=self.get_decor(elem))
                    if len(elem.get("Value", '')) > 0:
                        new_element = soup.new_tag("input", id=tvkey, type="date",
                                                   value=self.calculateField(elem.get("Value"), localData),
                                                   style=self.get_decor(elem))

                    if 'style_class' in elem:
                        new_element['class'] = new_element.get('class', []) + [elem.get('style_class')]

                    # new_form.append(new_element)
                    currentcontainer.append(new_element)

                if elem.get('type') == 'SpinnerLayout':

                    if len(elem.get("Value", '')) > 0:
                        values = self.calculateField(elem.get("Value", ''), localData).split(";")

                    new_element = soup.new_tag("input", id=tvkey, style=self.get_decor(elem), list="list" + tvkey)
                    currentcontainer.append(new_element)

                    new_element = soup.new_tag("datalist", id="list" + tvkey, style=self.get_decor(elem))
                    for el in values:
                        new_option = soup.new_tag("option", value=el)
                        new_element.append(new_option)

                    if 'style_class' in elem:
                        new_element['class'] = new_element.get('class', []) + [elem.get('style_class')]

                    # new_form.append(new_element)
                    currentcontainer.append(new_element)

                if elem.get('type') == 'CheckBox':

                    # new_form = soup.new_tag("form", method="post", action="/oninput/")

                    new_element = soup.new_tag("input", id=tvkey, type="checkbox", style=self.get_decor(elem))
                    if str(self.calculateField(elem.get("Value", ''), localData)).lower() == 'true':
                        new_element = soup.new_tag("input", id=tvkey, type="checkbox", style=self.get_decor(elem),
                                                   checked=True)
                    else:
                        new_element = soup.new_tag("input", id=tvkey, type="checkbox", style=self.get_decor(elem))

                    if 'style_class' in elem:
                        new_element['class'] = new_element.get('class', []) + [elem.get('style_class')]

                    # new_form.append(new_element)
                    currentcontainer.append(new_element)

                if elem.get('type') == 'Button':
                    # new_form = soup.new_tag("form", method="post", action="/oninput/")
                    # new_element = soup.new_tag("button", id=tvkey,onclick="myFunction(this,555)")

                    new_element = soup.new_tag("button", id=tvkey, style=self.get_decor(elem))
                    new_element.string = html.unescape(self.calculateField(elem.get("Value"), localData))

                    if 'style_class' in elem:
                        new_element['class'] = new_element.get('class', []) + [elem.get('style_class')]

                    if "#" in str(self.calculateField(elem.get("Value"), localData)):
                        new_element['class'] = new_element.get('class', []) + ['fa']

                    # new_form.append(new_element)
                    currentcontainer.append(new_element)

                if elem.get('type') == 'Picture':

                    new_element = soup.new_tag("img", id=tvkey, style=self.get_decor(elem),
                                               src="/static/" + self.calculateField(elem.get("Value"), localData))

                    if 'style_class' in elem:
                        new_element['class'] = new_element.get('class', []) + [elem.get('style_class')]

                    currentcontainer.append(new_element)

                if elem.get('type') == 'TableLayout':
                    if not elem.get("Value") == None:

                        styles = []
                        if "width" in elem:
                            if str(elem.get("width", "")).isnumeric():
                                styles.append("width:" + str(elem.get("width")) + "px")
                            elif elem.get("width", "") == "match_parent":
                                styles.append("width:100%")

                        if "height" in elem:
                            if str(elem.get("height", "")).isnumeric():
                                styles.append("height:" + str(elem.get("height")) + "px")
                            elif elem.get("height", "") == "match_parent":
                                styles.append("height:100%")

                        stylestr = ";".join(styles)

                        table_data = self.calculateField(elem.get("Value"), localData)
                        html_table = self.add_table(table_data, tvkey, stylestr)
                        if not html_table:
                            self.add_custom_table(table_data, tvkey, currentcontainer)
                        else:
                            currentcontainer.append(html_table)

                if elem.get('type') == 'CardsLayout':

                    styles = []

                    if "BackgroundColor" in elem:
                        if len(elem.get("BackgroundColor", "")) > 0:
                            styles.append("background-color:" + elem.get("BackgroundColor"))

                    if "width" in elem:
                        if str(elem.get("width", "")).isnumeric():
                            styles.append("width:" + str(elem.get("width")) + "px")
                        elif elem.get("width", "") == "match_parent":
                            styles.append("width:100%")

                    if "height" in elem:
                        if str(elem.get("height", "")).isnumeric():
                            styles.append("height:" + str(elem.get("height")) + "px")
                        elif elem.get("height", "") == "match_parent":
                            styles.append("height:100%")

                    styles.append("overflow-y: scroll;")

                    stylestr = ";".join(styles)

                    if not elem.get("Value") == None:
                        htmlcards = self.add_cards(self.calculateField(elem.get("Value"), localData), tvkey, stylestr)
                        if not htmlcards == None:
                            currentcontainer.append(htmlcards)

                            # if level==0:

        return bs4.BeautifulSoup(html.unescape(str(currentcontainer)), features='lxml')

    async def RunEvent(self, event, postExecute=None):

        if self.process is None:
            return

        json_str = {
            "process": self.process.get("ProcessName", ""),
            "operation": self.screen.get("Name", ""),
            "hashmap": self.hashMap}

        if 'Handlers' in self.screen or not (postExecute is None or postExecute == ''):
            # NEW HANDLERS

            if postExecute is None or postExecute == '':
                handlersArray = self.screen['Handlers']
            else:
                handlersArray = json.loads(postExecute)

            for handler in handlersArray:

                if event is not None:
                    if not handler.get('event') == event:
                        continue

                if handler.get('action') == 'run':
                    if handler.get('type') == 'python':
                        operation = handler.get('method')
                        self.set_input(operation, json.dumps(json_str, ensure_ascii=False).encode('utf-8'),
                                       self.process_data)

                    if handler.get('type') == 'online':
                        operation = handler.get('method')
                        self.set_input_online(operation, json.dumps(json_str, ensure_ascii=False))

                elif handler.get('action') == 'runasync':
                    if handler.get('type') == 'python':
                        operation = handler.get('method')

                        _thread = threading.Thread(target=self.async_callback, args=(
                            operation, json_str, self.current_tab_id, handler.get('postExecute', '')))
                        _thread.start()

                    if handler.get('type') == 'online':
                        operation = handler.get('method')

                        _thread = threading.Thread(target=self.async_callback_online, args=(
                            operation, json_str, self.current_tab_id, handler.get('postExecute', '')))
                        _thread.start()

                    if handler.get('type') == 'online':
                        operation = handler.get('method')
        else:

            # OLD HANDLERS

            if event == "onStart":
                if len(self.screen.get('DefOnCreate', '')) > 0:
                    operation = self.screen.get('DefOnCreate', '')

                    # Python
                    self.set_input(operation, json.dumps(json_str, ensure_ascii=False).encode('utf-8'),
                                   self.process_data)

                if len(self.screen.get('DefOnlineOnCreate', '')) > 0:
                    operation = self.screen.get('DefOnlineOnCreate', '')

                    # Online
                    self.set_input_online(operation, json.dumps(json_str, ensure_ascii=False))

            if event == "onInput":
                if len(self.screen.get('DefOnInput', '')) > 0:
                    operation = self.screen.get('DefOnInput', '')

                    # Python
                    self.set_input(operation, json.dumps(json_str, ensure_ascii=False).encode('utf-8'),
                                   self.process_data)

                if len(self.screen.get('DefOnlineOnInput', '')) > 0:
                    operation = self.screen.get('DefOnlineOnInput', '')

                    # Online
                    self.set_input_online(operation, json.dumps(json_str, ensure_ascii=False))

        if len(self.hashMap.get("ErrorMessage", "")) > 0:
            # print(self.hashMap.get("ErrorMessage",""))
            await self.socket_.emit('error', {'code': self.hashMap.get("ErrorMessage", "")}, room=self.sid,
                                    namespace='/' + SOCKET_NAMESPACE)

        try:
            await self.handle_command()
        except Exception as e:
            await self.socket_.emit('error', {'code': str(e)}, room=self.sid, namespace='/' + SOCKET_NAMESPACE)
            print(e)

    async def handle_command(self, current_tab=None):
        if current_tab == None:
            active_tab = self.current_tab_id
        else:
            active_tab = current_tab

        if 'SetValues' in self.hashMap:
            # TODO переделать одним запросом
            jSetValues = json.loads(self.hashMap.get('SetValues'))
            for el in jSetValues:
                for key, value in el.items():
                    await self.socket_.emit('setvalue', {'key': "d" + self.current_tab_id + "_" + key, 'value': el[key],
                                                         'tabid': self.current_tab_id}, room=self.sid,
                                            namespace='/' + SOCKET_NAMESPACE)

            self.hashMap.pop('SetValues', None)

        if 'SetValuesPulse' in self.hashMap:
            # TODO переделать одним запросом
            jSetValues = json.loads(self.hashMap.get('SetValuesPulse'))

            for el in jSetValues:
                for key, value in el.items():
                    await self.socket_.emit('setvaluepulse',
                                            {'key': "d" + active_tab + "_" + key, 'value': html.unescape(el[key]),
                                             'tabid': active_tab}, room=self.sid, namespace='/' + SOCKET_NAMESPACE)

            self.hashMap.pop('SetValuesPulse', None)

        if 'SetValuesTable' in self.hashMap:
            # TODO переделать одним запросом
            jSetValues = json.loads(self.hashMap.get('SetValuesTable'))
            for el in jSetValues:
                for key, value in el.items():
                    await self.socket_.emit('setvaluehtml', {'key': "tablediv_" + "d" + self.current_tab_id + "_" + key,
                                                             'value': str(
                                                                 self.add_table(json.dumps(el[key], ensure_ascii=False),
                                                                                "d" + self.current_tab_id + "_" + key)),
                                                             'tabid': self.current_tab_id}, sid=self.sid,
                                            namespace='/' + SOCKET_NAMESPACE)
            self.hashMap.pop('SetValuesTable', None)
        if 'SetValuesCards' in self.hashMap:
            # TODO переделать одним запросом
            jSetValues = json.loads(self.hashMap.get('SetValuesCards'))
            for el in jSetValues:
                for key, value in el.items():
                    await self.socket_.emit('setvaluehtml', {'key': "cardsdiv_" + "d" + self.current_tab_id + "_" + key,
                                                             'value': str(
                                                                 self.add_cards(json.dumps(el[key], ensure_ascii=False),
                                                                                "d" + self.current_tab_id + "_" + key)),
                                                             'tabid': self.current_tab_id}, sid=self.sid,
                                            namespace='/' + SOCKET_NAMESPACE)
            self.hashMap.pop('SetValuesCards', None)

        if 'CloseTab' in self.hashMap:
            await self.socket_.emit('close_tab',
                                    {'buttonid': "maintab_" + self.current_tab_id, 'tabid': self.current_tab_id},
                                    room=self.sid, namespace='/' + SOCKET_NAMESPACE)
            self.hashMap.pop('CloseTab', None)

        if 'LoginCommit' in self.hashMap:
            self.isreload = True
            soup = bs4.BeautifulSoup(features="lxml")

            menustr = self.configuration['ClientConfiguration'].get("MenuWebTemplate")
            self.make_menu(soup, soup, menustr)

            await self.socket_.emit('setvaluehtml', {"key": "sidenav", "value": str(soup)}, room=self.sid,
                                    namespace='/' + SOCKET_NAMESPACE)
            await self.socket_.emit('setmenulisteners', {}, room=self.sid, namespace='/' + SOCKET_NAMESPACE)

            self.hashMap.pop('LoginCommit', None)

        if 'OpenScreen' in self.hashMap:

            tabparameters = json.loads(self.hashMap.get('OpenScreen'))
            self.hashMap.pop('OpenScreen', None)
            soup = bs4.BeautifulSoup(features="lxml")
            tabid = str(uuid.uuid4().hex)
            self.current_tab_id = tabid
            added_tables = []

            title = None
            if 'SetTitle' in self.hashMap:
                title = self.hashMap.get('SetTitle', '')
                self.hashMap.pop('SetTitle', None)

            self.tabsHashMap[active_tab] = dict(self.hashMap)

            button, tab = self.new_screen_tab(self.configuration, tabparameters['process'], tabparameters['screen'],
                                              soup, tabid, title)

            await self.socket_.emit('add_html', {"id": "maintabs", "code": str(button)}, room=self.sid,
                                    namespace='/' + SOCKET_NAMESPACE)
            await self.socket_.emit('add_html', {"id": "maincontainer", "code": str(tab)}, room=self.sid,
                                    namespace='/' + SOCKET_NAMESPACE)
            await self.socket_.emit('click_button', {"id": "maintab_" + tabid}, room=self.sid,
                                    namespace='/' + SOCKET_NAMESPACE)

            firsttabslayout = []
            for t in added_tables:
                await self.socket_.emit('run_datatable', t, room=self.sid, namespace='/' + SOCKET_NAMESPACE)

            for t in firsttabslayout:
                await self.socket_.emit('click_button', {"id": t}, room=self.sid, namespace='/' + SOCKET_NAMESPACE)

        if 'TableAddRow' in self.hashMap:
            table_id = self.hashMap.get('TableAddRow')
            jtable = json.loads(self.hashMap.get(table_id))
            self.hashMap.pop('TableAddRow', None)

            if jtable.get('editmode') == 'modal':
                jline = {}

                dialogHTML = self.get_edit_html(jtable, jline, True)

                await self.socket_.emit('setvaluehtml', {"key": "modaldialog", "value": dialogHTML}, room=self.sid,
                                        namespace='/' + SOCKET_NAMESPACE)
                await self.socket_.emit('show_modal', {'table_id': table_id, 'selected_line_id': '-1'}, room=self.sid,
                                        namespace='/' + SOCKET_NAMESPACE)

        if 'TableEditRow' in self.hashMap:
            table_id = self.hashMap.get('TableEditRow')
            jtable = json.loads(self.hashMap.get(table_id))
            self.hashMap.pop('TableEditRow', None)

            if jtable.get('editmode') == 'modal':

                sel_line = 'selected_line_' + table_id
                if sel_line in self.hashMap:
                    jline = jtable['rows'][int(int(self.hashMap.get(sel_line)))]

                    dialogHTML = self.get_edit_html(jtable, jline, False)

                    await self.socket_.emit('setvaluehtml', {"key": "modaldialog", "value": dialogHTML}, room=self.sid,
                                            namespace='/' + SOCKET_NAMESPACE)
                    await self.socket_.emit('show_modal', {'table_id': self.hashMap["table_id"],
                                                           'selected_line_id': self.hashMap["selected_line_id"]},
                                            room=self.sid, namespace='/' + SOCKET_NAMESPACE)

        if 'UploadFile' in self.hashMap:
            file_id = self.hashMap.get('UploadFile')

            self.hashMap.pop('UploadFile', None)

            await self.socket_.emit('upload_file', {'file_id': "d" + self.current_tab_id + "_" + file_id},
                                    room=self.sid,
                                    namespace='/' + SOCKET_NAMESPACE)

        if 'toast' in self.hashMap:
            text = self.hashMap.get('toast', '')
            self.hashMap.pop('toast', None)
            toastid = str(uuid.uuid4().hex)
            await self.socket_.emit('toast', {'code': text, 'id': toastid}, room=self.sid,
                                    namespace='/' + SOCKET_NAMESPACE)

        if 'beep' in self.hashMap:
            self.hashMap.pop('beep', None)
            toastid = str(uuid.uuid4().hex)

            await self.socket_.emit('beep', {}, room=self.sid, namespace='/' + SOCKET_NAMESPACE, to=self.sid)

        if 'ShowDialog' in self.hashMap:
            text = self.hashMap.get('ShowDialog', '')
            self.hashMap.pop('ShowDialog', None)
            title = "Вопрос"
            YesBtn = 'Да'
            NoBtn = 'Нет'
            if 'ShowDialogStyle' in self.hashMap:
                strstyle = self.hashMap.get('ShowDialogStyle')

                try:
                    jstyle = json.loads(strstyle)
                    YesBtn = jstyle.get("yes", "")
                    NoBtn = jstyle.get("no", "")
                    title = jstyle.get("title", "")
                except ValueError as e:
                    self.hashMap.put("ErrorMessage", str(e))

                self.hashMap.pop('ShowDialogStyle', None)

            toastid = str(uuid.uuid4().hex)

            dialogHTML = """<dialog>
               <div class="dialogmodal-header">

                <h4>""" + title + """</h4>
              </div>
              <p/>
              <div>   """ + text + """    </div>
              <p/>
              <div>
              <button class="closedialog" id="onResultPositive">""" + YesBtn + """</button>

              <button class="closedialog" id="onResultNegative">""" + NoBtn + """</button>
              </div>
              </dialog>"""
            await self.socket_.emit('setvaluehtml', {"key": "modaldialog", "value": dialogHTML}, room=self.sid,
                                    namespace='/' + SOCKET_NAMESPACE)
            await self.socket_.emit('show_dialog', {'code': text, 'id': toastid}, room=self.sid,
                                    namespace='/' + SOCKET_NAMESPACE)

        if 'basic_notification' in self.hashMap:
            jnotification = json.loads(self.hashMap.get("basic_notification"))
            self.hashMap.pop('basic_notification', None)

            text = jnotification.get('message', '')
            notificationid = str(jnotification.get('number', ''))
            title = jnotification.get('title', '')

            await self.socket_.emit('notification', {'text': text, 'id': notificationid, 'title': title}, room=self.sid,
                                    namespace='/' + SOCKET_NAMESPACE)

        if 'ShowScreen' in self.hashMap:
            screenname = self.hashMap.get('ShowScreen', '')
            if "{" in screenname and "}" in screenname and ":" in screenname:  # looks like json...
                jdata = json.loads(screenname)
                process = self.get_process(self.configuration, jdata['process'])
                screen = self.get_screen(process, jdata['screen'])
            else:
                screen = self.get_screen(self.process, screenname)

            if screen == None:
                await self.socket_.emit('setvaluehtml', {'key': "root_" + self.current_tab_id,
                                                         'value': '<h1>Не найден экран: ' + screenname + '</h1>',
                                                         'tabid': self.current_tab_id}, room=self.sid,
                                        namespace='/' + SOCKET_NAMESPACE)
            else:
                self.hashMap.pop('ShowScreen', None)
                soup = bs4.BeautifulSoup(features="lxml")

                added_tables = []
                firsttabslayout = []

                self.screen = screen

                await self.RunEvent("onStart")

                layots = self.get_layouts(soup, screen, 0)

                await self.socket_.emit('setvaluehtml', {'key': "root_" + self.current_tab_id, 'value': str(layots),
                                                         'tabid': self.current_tab_id}, room=self.sid,
                                        namespace='/' + SOCKET_NAMESPACE)

                for t in added_tables:
                    await self.socket_.emit('run_datatable', t, room=self.sid, namespace='/' + SOCKET_NAMESPACE)

                for t in firsttabslayout:
                    await self.socket_.emit('click_button', {"id": t}, room=self.sid, namespace='/' + SOCKET_NAMESPACE)

        self.tabsHashMap[active_tab] = dict(self.hashMap)

    async def input_event(self, message):
        event = "Input"
        hashMap = self.hashMap
        hashMap["event"] = event

        if not message == None:
            if message.get('data') == 'barcode':
                barcodeelements = list(filter(lambda tag: tag['type'] == "barcode", self.screen['Elements']))
                if len(barcodeelements) > 0:
                    hashMap['listener'] = 'barcode'
                    hashMap[barcodeelements[0]['Variable']] = message['barcode']
                else:
                    return

            elif message.get('data') == 'upload_file':
                spl = message.get('source').split('_')
                hashMap["file_id"] = spl[1]
                hashMap["filename"] = message.get('filename')
                hashMap['listener'] = 'upload_file'

            elif message.get('data') == 'table_click' and not message.get('source') == None:
                hashMap["listener"] = 'TableClick'
                spl = message.get('source').split('_')
                hashMap["table_id"] = spl[3]
                hashMap["selected_line_id"] = spl[1]
                hashMap["selected_line_" + hashMap["table_id"]] = spl[1]

            elif message.get('data') == 'table_doubleclick' and not message.get('source') == None:
                hashMap["listener"] = 'TableClick'
                spl = message.get('source').split('_')
                hashMap["table_id"] = spl[3]
                hashMap["selected_line_id"] = spl[1]

                jtable = json.loads(self.hashMap.get(spl[3]))
                if jtable.get('editmode') == 'modal':
                    jline = jtable['rows'][int(spl[1])]

                    dialogHTML = self.get_edit_html(jtable, jline, False)

                    self.socket_.emit('setvaluehtml', {"key": "modaldialog", "value": dialogHTML}, room=self.sid,
                                      namespace='/' + SOCKET_NAMESPACE)
                    self.socket_.emit('show_modal', {'table_id': hashMap["table_id"],
                                                     'selected_line_id': hashMap["selected_line_id"]}, room=self.sid,
                                      namespace='/' + SOCKET_NAMESPACE)

            elif message.get('data') == 'edittable_result':
                if message.get("source") == 'onResultPositive':
                    tableid = message.get('table_id')
                    selected_line_id = message.get('selected_line_id', "-1")
                    jtable = json.loads(hashMap.get(tableid))
                    jvalues = json.loads(message.get('values'))

                    lvalues = {}

                    if selected_line_id == "-1":
                        jrow = {}
                        for item in jvalues:
                            for key, value in item.items():
                                skey = key.split('_')
                                jrow[skey[2]] = value
                                lvalues[skey[2]] = value
                        jtable['rows'].append(jrow)
                    else:
                        jrow = jtable['rows'][int(selected_line_id)]

                        for item in jvalues:
                            for key, value in item.items():
                                skey = key.split('_')
                                jrow[skey[2]] = value
                                lvalues[skey[2]] = value

                    hashMap["listener"] = 'TableEditModal'

                    hashMap["table_id"] = tableid
                    hashMap["selected_line_id"] = selected_line_id

                    hashMap["table_values"] = json.dumps(lvalues, ensure_ascii=False)

                    hashMap["selected_line"] = json.dumps(jrow, ensure_ascii=False)

                    hashMap[tableid] = json.dumps(jtable, ensure_ascii=False)
                    hashMap['SetValuesTable'] = json.dumps([{tableid: jtable}])
                else:
                    hashMap["listener"] = ''


            elif message.get('data') == 'table_edit' and not message.get('source_row') == None:
                hashMap["listener"] = 'TableEdit'
                spl = message.get('source_row').split('_')
                hashMap["table_id"] = spl[3]
                hashMap["selected_line_id"] = spl[1]
                if len(message.get("valuetext", '')) > 0:
                    hashMap["table_value"] = str(message.get("valuetext", ''))
                else:  # пока чекбокс
                    hashMap["table_value"] = str(message.get("valuecb")).lower()
                if len(spl[3]) > 0:
                    table = json.loads(hashMap.get(spl[3]))
                    columns = table['columns']
                    hashMap["table_column"] = columns[message.get('source_column')]['name']
                    rows = table['rows']
                    hashMap["selected_line"] = json.dumps(rows[int(spl[1])], ensure_ascii=False)

            elif message.get('data') == 'card_event':
                hashMap["listener"] = 'LayoutAction'
                spl = message.get('source').split('_')
                hashMap["card_id"] = str(spl[3])
                hashMap["selected_card_position"] = spl[1]

                elemid = ""
                for i in range(5, len(spl)):
                    sep = ""
                    if len(elemid) > 0:
                        sep = "_"
                    elemid += sep + spl[i]

                hashMap["layout_listener"] = elemid
                self.blocknext = True
            elif message.get('data') == 'dialog_result':
                hashMap["event"] = message.get('source')
                hashMap["listener"] = message.get('source')
            elif message.get('data') == 'card_click':
                if self.blocknext:
                    self.blocknext = False
                    return
                else:
                    hashMap["listener"] = 'CardsClick'
                    spl = message.get('source').split('_')
                    hashMap["card_id"] = str(spl[3])
                    hashMap["selected_card_position"] = spl[1]
            elif message.get('data') == 'text_input':
                if self.current_tab_id in message.get('source'):
                    hashMap[message.get('source')[34:]] = message.get('value')

                hashMap["listener"] = message['source'][34:]
            else:
                if 'values' in message:
                    jvalues = json.loads(message['values'])
                    for el in jvalues:
                        for key, value in el.items():
                            if self.current_tab_id in key:
                                hashMap[key[34:]] = el[key]

                if 'source' in message:
                    hashMap["listener"] = message['source'][34:]

            await self.RunEvent("onInput")

    async def close_maintab(self, message):
        super().close_maintab(message)

    async def select_tab(self, message):
        super().select_tab(message)

    def add_custom_table(self, table_content, variable, container):
        variable = variable or f'table_{str(uuid.uuid4().hex)}'
        jtable = json.loads(table_content)

        if not jtable.get('customtable'):
            return

        root = jtable['customtable']['layout']
        basic_table = f'<div class="container" id="tablediv_{variable}"></div>'
        base = bs4.BeautifulSoup(basic_table, features="lxml")

        root_div = base.find(id=f'tablediv_{variable}')
        ul = base.new_tag('ul')

        for row in jtable['customtable']['tabledata']:
            html_layout = self.get_html_elements(root, data=row)
            li = base.new_tag('li')
            li.append(html_layout)
            ul.append(li)

        root_div.append(ul)
        container.append(root_div)

    def get_html_elements(self, params, data=None):
        html_element = self.html.get_element(params, data)

        if html_element is None:
            return

        if params.get('Elements'):
            for item in params['Elements']:
                new_element = self.get_html_elements(item, data)
                if new_element:
                    html_element.append(new_element)

        return html_element

    def set_input(self, method, data, ddata):
        f = None
        try:
            module = __import__('current_handlers')
            jdata = json.loads(data)
            jhashMap = javahashMap()
            jhashMap.importdict(self.hashMap)
            f = getattr(module, method)
            res = f(jhashMap, None, ddata)
            jdata['hashmap'] = res.export()
            jdata['stop'] = False
            jdata['ErrorMessage'] = ""
            jdata['Rows'] = []

            self.hashMap = res.d

            return json.dumps(jdata, ensure_ascii=False)
        except Exception as e:
            if f and getattr(f, '__name__'):
                import traceback

                stack = traceback.extract_tb(e.__traceback__)[:2]
                pretty = traceback.format_list(stack)
                error_traceback = '<br>'.join(pretty) + '\n  {} {}'.format(e.__class__, e)

                # error_traceback = traceback.format_exception(etype=type(e), value=e, tb=e.__traceback__)
                # error_traceback = ''.join(traceback.TracebackException.from_exception(e).format())
                self.hashMap['ErrorMessage'] = html.unescape(f'Error in handler: {f.__name__}<br>{error_traceback}')

            else:
                self.hashMap['ErrorMessage'] = str(e)

    def load_settings(self, path):
        if pathlib.Path(path).is_file():
            with open(path, encoding='utf-8') as f:
                web_settings = json.load(f)
                self.urlonline = web_settings.get('url', '')
                self.username = web_settings.get('user', '')
                self.password = web_settings.get('password', '')

    @staticmethod
    def get_process(configuration, processname):
        for process in configuration['ClientConfiguration']['Processes']:
            if process.get('ProcessName', '') == processname and process.get('type', '') == 'Process':
                return process

    @staticmethod
    def get_screen(process, screensname=''):
        if len(screensname) == 0 and len(process['Operations']) > 0:
            return process['Operations'][0]
        else:
            for screen in process['Operations']:
                if screen.get('Name', '') == screensname and screen.get('type', '') == 'Operation':
                    return screen

    @staticmethod
    def get_decor(elem):
        styles = []

        if "TextColor" in elem:
            if len(elem.get("TextColor", "")) > 0:
                styles.append("color:" + elem.get("TextColor"))

        if "BackgroundColor" in elem:
            if len(elem.get("BackgroundColor", "")) > 0:
                styles.append("background-color:" + elem.get("BackgroundColor"))

        if "TextSize" in elem:
            if len(elem.get("TextSize", "")) > 0:
                styles.append("font-size:" + elem.get("TextSize") + "px")

        if "TextBold" in elem:
            if str(elem.get("TextBold", "")) == "true" or elem.get("TextBold") == True:
                styles.append("font-weight:bold")

        if "TextItalic" in elem:
            if str(elem.get("TextItalic", "")) == "true" or elem.get("TextItalic") == True:
                styles.append("font-style:italic")

        if "gravity_horizontal" in elem:
            if str(elem.get("gravity_horizontal", "")) == "right":
                styles.append("text-align: right;")
            elif str(elem.get("gravity_horizontal", "")) == "left":
                styles.append("text-align: left;")
            else:
                styles.append("text-align: center;")
        else:
            styles.append("text-align: center;")

        if "width" in elem:
            if str(elem.get("width", "")).isnumeric():
                styles.append("width:" + str(elem.get("width")) + "px")
            elif elem.get("width", "") == "match_parent":
                styles.append("width:100%")

        if "height" in elem:
            if str(elem.get("height", "")).isnumeric():
                styles.append("height:" + str(elem.get("height")) + "px")
            elif elem.get("height", "") == "match_parent":
                styles.append("height:100%")

        styles.append("margin: 3px")

        return ";".join(styles)


class HTMLCreator:
    def __init__(self, source):
        self.soup = bs4.BeautifulSoup(source, features="lxml")
        self.config = self._get_config()
        self.styles_config = self._get_styles_config()

    def get_element(self, params, data=None):
        if not params.get('type'):
            return None

        style = ';'.join(self._get_styles(params))

        return self.config.get(params['type'])(params, style, data)

    def get_linear_layout(self, params: dict, style: str, data=None):
        if params.get('orientation') == 'horizontal':
            class_name = 'container-horizontal'
        else:
            class_name = 'container-vertical'

        return self.soup.new_tag(
            "div", **{'class': class_name}, style=style)

    def get_picture(self, params: dict, style: str, data=None):
        return self.soup.new_tag(
            "img",
            # id=tvkey,
            style=style,
            # src=f'/static/{self.get_element_data(params, data)}'
            src=f'data:image/png;base64,{self.get_element_data(params, data)}'
        )

        # if 'style_class' in params:
        #     new_element['class'] = new_element.get('class', []) + [elem.get('style_class')]

    def get_text_view(self, params: dict, style: str, data=None):
        new_element = self.soup.new_tag("p", style=style)
        new_element.string = html.unescape(self.get_element_data(params, data))

        # if 'style_class' in elem:
        #     new_element['class'] = new_element.get('class', []) + [elem.get('style_class')]
        #
        # if "#" in str(self.calculateField(elem.get("Value"), localData)):
        #     new_element['class'] = new_element.get('class', []) + ['fa']

        return new_element

    @staticmethod
    def get_element_data(params, data):
        if params.get('Value'):
            if str(params['Value']).startswith('@') and data:
                return data.get(params['Value'][1:], '')
            else:
                return params['Value']

    def _get_styles(self, element):
        element_styles_config = self.styles_config.get(element['type'])
        styles = []
        for prop in element:
            self._add_styles(element, element_styles_config, prop, styles)

        return styles

    def _add_styles(self, element, config, prop, styles):
        if not config:
            return

        def add_style_from_func(func_list):
            for func in func_list:
                if isinstance(func, LambdaType):
                    res = func(element)
                    if res:
                        styles.append(res.format(**element))
                        break

        style_value = config.get(prop)

        if isinstance(style_value, dict):
            self._add_styles(element, style_value, element[prop], styles)
        elif isinstance(style_value, list):
            for item in style_value:
                for k, v in item.items():
                    if element.get(k) and element[k] in v:
                        self._add_styles(element, v, element[k], styles)
                    elif element.get(k):
                        add_style_from_func(v.values())

        elif isinstance(style_value, str):
            styles.append(style_value.format(**element))
        elif isinstance(style_value, LambdaType):
            result = style_value(element)
            if result:
                styles.append(result.format(**element))

    def _get_config(self):
        return {
            'LinearLayout': self.get_linear_layout,
            'Picture': self.get_picture,
            'TextView': self.get_text_view
        }

    @staticmethod
    def _get_styles_config():
        return {
            'LinearLayout': {
                'orientation': {
                    'horizontal': [
                        {
                            'gravity_horizontal':
                                {
                                    'center': 'justify-content:center',
                                    'left': 'justify-content:flex-start',
                                    'right': 'justify-content:flex-end'
                                }
                        },
                        {
                            'gravity_vertical': {
                                'center': 'align-items:center',
                                'top': 'align-items:flex-start',
                                'bottom': 'align-items:flex-end'
                            }
                        },
                        {
                            'width': {
                                'isnumeric': lambda x: 'flex:{width}px' if str(x.get('width')).isnumeric() else None,
                                'match_parent': 'flex:1',
                                'wrap_content': 'flex:{weight}'
                            }
                        },
                        {
                            'height': {
                                'isnumeric': lambda x: 'height:{height}px' if str(x.get('width')).isnumeric() else None,
                                'match_parent': 'height:100%'
                            }
                        }
                    ],
                    'vertical': [
                        {
                            'gravity_vertical': {
                                'center': 'justify-content:center',
                                'left': 'justify-content:flex-start',
                                'right': 'justify-content:flex-end'
                            }
                        },
                        {
                            'gravity_horizontal': {
                                'center': 'align-items:center',
                                'top': 'align-items:flex-start',
                                'bottom': 'align-items:flex-end'
                            }
                        },
                        {
                            'height': {
                                'isnumeric': lambda x: 'flex:{height}px' if str(x.get('width')).isnumeric() else None,
                                'match_parent': 'flex:1',
                                'wrap_content': 'flex:{weight}'
                            }
                        },
                        {
                            'width': {
                                'isnumeric': lambda x: 'height:{width}px' if str(x.get('width')).isnumeric() else None,
                                'match_parent': 'height:100%'
                            }
                        }
                    ]
                },
                'BackgroundColor': 'background-color:{BackgroundColor}',
                'StrokeWidth': 'border:{StrokeWidth}px solid #242222',
                'Padding': 'padding:{Padding}px'
            }
        }


class javahashMap:
    d = {}

    def put(self, key, val):
        self.d[key] = val

    def get(self, key):
        return self.d.get(key)

    def remove(self, key):
        if key in self.d:
            self.d.pop(key)

    def containsKey(self, key):
        return key in self.d

    def importmap(self, arr):
        self.d = {}
        for pair in arr:
            self.d[pair['key']] = pair['value']

    def importdict(self, d):
        self.d = d

    def export(self):
        ex_hashMap = []
        for key in self.d.keys():
            ex_hashMap.append({"key": key, "value": self.d[key]})
        return ex_hashMap
