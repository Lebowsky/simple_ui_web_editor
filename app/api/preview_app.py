import json
import os

from uiweb import Simple, bs4, uuid, threading, SOCKET_NAMESPACE, html

from ..ui import get_current_file_path
from ..config import resource_path


class AsyncSimple(Simple):
    def __init__(self, socket):
        super().__init__(socket, '')
        path_to_handlers = resource_path('current_handlers.py')
        if os.path.exists(path_to_handlers):
            print('handlers update')
            module = __import__('current_handlers')
            import importlib
            importlib.reload(module)

    async def build_page(self):

        file_path = await get_current_file_path()

        with open(file_path, encoding='utf-8') as file:
            self.configuration = json.load(file)

        res = super().build_page()
        res = res.replace(
            'io(namespace, {reconnection: false})', 'io(namespace, {reconnection: false, path: "/ws/socket.io"})')

        return res

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

                    # thr = threading.Thread(target=self.online_task,args=(operation,json_str))
                    # thr.start()
                    # print("сразу после")

                    # thr.join()
                    # print("после joina")

                    # self.online_task(operation,json_str)
                    # a=''
                    # self.set_input_online(operation,json.dumps(json_str,ensure_ascii=False))

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

    async def run_process(self, message):
        self.process_data = {}
        str_process_name = message.strip()

        if not self.menutemplate == None:
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

        # print(tabid)
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

    async def handle_command(self, current_tab=None):

        if current_tab == None:
            active_tab = self.current_tab_id
        else:
            active_tab = current_tab

        # Simple.socket_.emit('setvaluepulse', {'key':"d"+Simple.current_tab_id+"_"+key,'value':el[key],'tabid':Simple.current_tab_id},sid=self.sid,namespace='/'+SOCKET_NAMESPACE)
        if 'SetValues' in self.hashMap:
            # TODO переделать одним запросом
            jSetValues = json.loads(self.hashMap.get('SetValues'))
            for el in jSetValues:
                for key, value in el.items():
                    await self.socket_.emit('setvalue', {'key': "d" + self.current_tab_id + "_" + key, 'value': el[key],
                                                   'tabid': self.current_tab_id}, room=self.sid,
                                      namespace='/' + SOCKET_NAMESPACE)
                    # print("d"+Simple.current_tab_id+"_"+key)

            self.hashMap.pop('SetValues', None)

        if 'SetValuesPulse' in self.hashMap:
            # TODO переделать одним запросом
            jSetValues = json.loads(self.hashMap.get('SetValuesPulse'))

            # r = requests.post('http://localhost:5000/setvaluespulse', json=jSetValues)

            # self.set_values_pulse(jSetValues)
            for el in jSetValues:
                for key, value in el.items():
                    await self.socket_.emit('setvaluepulse',
                                      {'key': "d" + active_tab + "_" + key, 'value': html.unescape(el[key]),
                                       'tabid': active_tab}, room=self.sid, namespace='/' + SOCKET_NAMESPACE)
                    # jSetValues = [{'key':"d"+Simple.current_tab_id+"_"+key,'value':el[key],'tabid':Simple.current_tab_id}]
                    # self.set_values_pulse(jSetValues)
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
                    # self.socket_.emit('run_datatable',{"id":"d"+self.current_tab_id+"_"+key} ,room=self.sid,namespace='/'+SOCKET_NAMESPACE)
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
            await self.socket_.emit('close_tab', {'buttonid': "maintab_" + self.current_tab_id, 'tabid': self.current_tab_id},
                              room=self.sid, namespace='/' + SOCKET_NAMESPACE)
            self.hashMap.pop('CloseTab', None)

        if 'LoginCommit' in self.hashMap:
            self.isreload = True
            # self.socket_.emit('reload', {},sid=self.sid,namespace='/'+SOCKET_NAMESPACE)

            # self.socket_.emit('close_tab', {'buttonid':"maintab_"+self.current_tab_id,'tabid':self.current_tab_id},sid=self.sid,namespace='/'+SOCKET_NAMESPACE)
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

            await self.socket_.emit('upload_file', {'file_id': "d" + self.current_tab_id + "_" + file_id}, room=self.sid,
                              namespace='/' + SOCKET_NAMESPACE)

        if 'toast' in self.hashMap:
            text = self.hashMap.get('toast', '')
            self.hashMap.pop('toast', None)
            toastid = str(uuid.uuid4().hex)
            # toasthtml = """<div class="alert" id="""+toastid+"""
            # <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span> """ + text+ '</div>'
            await self.socket_.emit('toast', {'code': text, 'id': toastid}, room=self.sid, namespace='/' + SOCKET_NAMESPACE)

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
            # toasthtml = """<div class="alert" id="""+toastid+"""
            # <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span> """ + text+ '</div>'

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


    async def close_maintab(self, message):
        super().close_maintab(message)

    async def select_tab(self, message):
        super().select_tab(message)

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
