from flet import *

class ProcessButton(ElevatedButton):
    def __init__(self, text):
        super().__init__(text=text)
        self.width = 600
        self._initialize_button()

    def _initialize_button(self):
        self.content = Text(value=self.text, size=20, weight=FontWeight.W_600, text_align=TextAlign.CENTER, color=colors.BLACK87)
        
        self.bgcolor = "#e5e5e2"
        self.color = "#5e5a5a"
        self.width = self.width
        self.height = "50"
        self.style = ButtonStyle(
            overlay_color="#e5e5e2",
            shape=RoundedRectangleBorder(radius=15),
        )
        self.elevation = 0

class MainButton(ElevatedButton):
    def __init__(self, text, text_size, expand):
        super().__init__(text=text)
        self.text_size = text_size
        self._initialize_button()

    def _initialize_button(self):
        self.content = Row(
            [
                Text(
                    value=self.text, 
                    size=self.text_size, 
                    weight=FontWeight.W_600, 
                    text_align=TextAlign.CENTER, 
                    color=colors.BLACK87
                    )
            ],
            alignment=MainAxisAlignment.CENTER
        )
        
        self.bgcolor = "#d5d7d4"
        self.color = "#585b57"
        self.height = "30"
        self.style = ButtonStyle(
            overlay_color="#d5d7d4",
            shape=ContinuousRectangleBorder(),
        )
        self.elevation = 0

class ProgressButton(OutlinedButton):
    def __init__(self, text):
        super().__init__(text=text)
        self._initialize_button()

    def _initialize_button(self):
        self.content = Row([Text(
            value=self.text, 
            size=16, 
            weight=FontWeight.W_500, 
            text_align=TextAlign.LEFT, 
            color=colors.BLACK54, 
            )], alignment=MainAxisAlignment.START)
        
        self.bgcolor = colors.WHITE
        self.color = colors.WHITE
        self.height = "35"
        self.style = ButtonStyle(
            bgcolor = colors.WHITE,
            shadow_color= colors.BLACK,
            overlay_color=colors.WHITE,
            shape=RoundedRectangleBorder(radius=25),
            padding=Padding(left=35, right=15, top=0, bottom=0),
            elevation={"pressed": 0, "": 1},
            side=BorderSide(1, colors.BLACK12)
        )
