from flet import *
import flet as ft

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
    def __init__(self, text, text_size):
        super().__init__(text=text)
        self.text_size = text_size
        self.width = 1000
        self._initialize_button()

    def _initialize_button(self):
        self.content = Text(value=self.text, size=self.text_size, weight=FontWeight.W_600, text_align=TextAlign.CENTER, color=colors.BLACK87)
        
        self.bgcolor = "#d5d7d4"
        self.color = "#585b57"
        self.height = "30"
        self.width = self.width
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
            padding=Padding(left=35, right=0, top=0, bottom=0),
            elevation={"pressed": 0, "": 1},
            side=BorderSide(1, colors.BLACK12)
        )

class BaseScreen(View):
    def __init__(self):
        super().__init__()
        self.route='/',
        self.bgcolor="#f8faf7"
        self.horizontal_alignment="center"
        self.vertical_alignment="center"
        self._initialize_screen()
    
    def _initialize_screen(self):

        img = Row([Image(
            src_base64="iVBORw0KGgoAAAANSUhEUgAAAHcAAABBCAIAAABkeKxtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAACsUSURBVHhe7dyHU1Tptjbw86/cM/mMidA50jQ5CaISmqyCIAoiKBgQFcWcc0Idc84JExkTYo6IQtM509A00P09a29QZ+bcW/dWfTW3btVQv8NpQBh4evV617v37v5HQzL3f0zFaVD5Q30Si1OXTBpSuE2MZhWvRcVrTuY2JXNbUvnQTAQkhaEiTSl85keNYH54IyRxGxJ50JgkaEzkkyReIz4k9GFDoqA+WVivEjUkixqThQxBUxKD/feJ/PoEXn0yry6FD/eIAOpSRLUpgnoVvlfYoBI1JokaE4VNrGRSn8yvT+aSJE5DImlOAC40JeAXw2/Cb0gm9SpuvYoD7C/PfIhkfh/UiP9hyuwPUnEbh/GgOU3wcIoQ2qaLX8+UwafiIE1pqLY0TFsWrpkXCuq5oZ1zQkgh+ZQfDB/zlB+mK+B9DnmXGQDv0xVvU+RvEsmribKX8RJ4MUH8bLyIxIihLUrcGil5FCF5FCJ6oBTA/QBei5QDTSJOo4gH9UJ+nUhwT0Juy0W3AiVwUymrCZbXhCjgdljQ7fCQO5Gh96LD4G4suRUfcntyENxNUtQmSaEpmd+cxIOmRF4T3uP+TiZMxP7wd8r/11JuTOF9gVgfZIigLVsG74qCP5WSrgVKXXkgmCoUlgqZbbHMukhmLBOTeWJDsQT0BWLQ5UlJjlQ3VUay5KBNDiAJAdpJCl2ckkQFakJloA6SqZUB0KUIJDJlpyT4kyC4gxP0yTcYOsYqP44OhvZRYe9HxcDb0fGvxya88E+GJ8LUB/IMaAqa0hAyrT48G2ojpt+Jml4TNf0G4/r4bLgcm3lpQgpcS0y6oYqDGlXA3RQpoEE1JvMBbRAaVZxGlT98qbxhf4oO/suUR76zEd02leBGcxrvSY7ofbEcuhcrwFyltKyUg3WlzL6COColPUuEjnKBbQHfNI9HSgTGImIoEIJxuphMk5iypGDOkINhsozEywyxclOMEiyRwYagQNApAnUBwURKtMIQDT+s2z+s2ydMPSocun+J6P4pGrp+nvB5TAro5IV21SrbvGqwrjtj3nsVjIduGA7f1B8husM3u/ZdfLPx6P2KXXCnaD2cS1lwLL6QTJ51LCkXjqemn0+fBDdTg+tSJNCk4kOzitOUQhpSeOQP0f3ev0n527JlIGi/hhQfaM0RvJuj0FQEWdcEQu9mGdnEt6/xB8cqrmMFD3qW8Z0VfMdCvq2Mb5krANMcoaFQQGYKwZQjBuMUiSlDBuY0ORjipSROaoyRmaICSViQPkgJ2oAgrTwUNJIwUAtCO/1D1b5hmnGRXWOjoWNMrCUgG9yple7FR2Bw2w3vpefex2rSYfEancTe53W6vE687/PanB6d2fXus/XxG9DdboW3B2vurzsNF+Zu35m+iGSV788shBPpyZdTI+CWSg71Kh47AtSlYI39z1LG5+lLf6f8v5QyC/mOdAz/pjTfZzME0LlQYV2jdCLZrQJwbuaAfZ2fYw0HelbxHZUCcC4VOhajXQispUJzMaNIbCwQgWGGGIxTpSRTakqTERUxxjNi5cYouTFcAYaQQF0g0ciVOlk4dIsiQM2P6PaP0PlFq0dF2gKzoC99gWfVIfDWtHm7HcTa73V6vS4PcQ96PR5Cb0Ne7yDxDNDtoQHvEN4PeV0DxO52vNfAixvNl7ceg8256zZkr4RNOeV7p86EU5kJUJOmrEvlk3+fMpvv15S/+RiZjjQaWjFTOdCS5feqUGCsCob+bWF926TOrVznFl/o2eQHjnVMFcNyvmOpAOyLBY5yoW2B0DpXaJkjAlOh2DiTGHKJaYqcpMuMKYxExoQAMj7AGBlgDAsEA6pYEQQaWYhOHA4aQQSouZEaTqxWlGSYMNu76iCpfeb9ZCRmp3dwgFCOg0y0niFCWXq8+AwMgJd5z94gHjcZGvAMuImz36G2wOF1xzaW7obKmZvW5FfBjty5cCQ76/yUGLibJgA2awoNEdN7dqwWMihl5mOqf5pOGtMQNKVcl8q5n82Ht/MkptWBfdsV0L9T3Led27sV4SJi3571/mQN117FqOTZK/ikXGBfILSVCiwlQkuRCMwFYvMMYkLEkCkDY5rMqJKTBGKICwB9dIA+PMAQoiTKUG1AGHRLwvSiCNDxI0EriLWETHPPWuc93+h9oybWHm9fH3G7vYOMIaSGQJEsW6sD4PG4v8Y6kvIIfMntQYEzd4pncHCon3R+6L51sQm2VB5eVrITlhRtgtVFK3fkF8L1jAC4lyKEOmSI7QxiTBFAg0pM/phyCqc+xb8BW7IUfstUwZt5MjCsDnTtVLh28aFvp1/vdt9eFPJGP+hZ509Wc+3LGUu5tsXEuoBnLeVZSviWIoGlUAimfJEpV0KyxcAOFaYUuTGJMYkYxitAH6nQhSkMQZgugg2KcI2MqMUR3QIGPwYccTOGKvd5a1q9Gpu3z00GB4cNDSIgghtMxCOYKkbK1Ci+RDzIpv8tpqV85ep36zRmqLvdunXLWZhfXg2lZbuWlqyCk9Mmwe20AKjDrhIbV5rz+Awh/J3y/0rKKv9alW9zhhBeFskNa4OgZ7u8D/nu8gXXTp++rT7OTT7ODX7QgxUP695KjqOSC/YlHFs5FyzzuZZ5PCvaxWyheSYx5YmM2WIylZEqI8kjvSI+gEQHgj5coQsO1AcGE3mYBr1YHP6ZH/5ZGA2mmKkwVLXPe/+V12RDf3APDADy+7K80U0PHvPoEl+DRgv4YjhxJvqvnx9O2c3eByN3w4B7yD0wNAB2R09dy2tYufUcFJbvLynfBzsKiuDslAlwK0XBHGChMIHdxeDGcMr1SWgovHtJvs2Z3Gf5UtCvDHHukkHvHm7vbt/enT5ku0/fZl/nep+eNb7gWMUBW6W/bSmjnGNdyCVlPPNcHgrZVCCgKs4XGaeLTNkoZIkxi4GJAhLlBpTwJLke7RgiA8EQFqinbYgStNIgrTAUPnFC7HHTwFO1A7wPXnjNFm9/L5Y4BAsIjE0ZKF8mYtQ2u+jh9r/zh88zKXvcA4N9MEQlT6MIfgjzX6AfbLb3wb3772HZpjMFSw9D2YKNsLGwGM5kxdHORcWvTeZAXTIXEDqbsmA4axXnUTb/c3kA9O5Quqr50Lt3nHP3OOd20rsFVezTsxb5Mqr8wb7M31bBWMSxzucStItivnm2wIRCZhY9IzMdk3RiSpKDYbJcH8+IVZBwFHKgPkSpVwbpA4hOHKQThYExNHGwbBV46x4So8nb3+Px9DOFywTABE1ZUyR0c9A7AF9C/PIhe+PLlxAi+++HeQb7Xb1g0uu7OzthYHC4B6Gu2bLv1tvhyt220rVHYXrlEShdtAl2z5x+NSv0bpqoNoULdaw/pNyUzn89R+zYEgDu/UJXtS8494zt2Tm2d5sPoFf0rPd1rPFzVBF7JXEs4zgquGBbQPkyEfOsRUJLgcg8A+2YhgrqEpkSMKSR4UYxkSlhmisUJFRJgpBvsEFK9OJQjTQGnNPmei/UEL2JDGIGRolhGGDrjKk6jBRMNY/EhyHZzVYoe5v98A+3B6gtMPcUeoxnyNXjbH/1Dm5funnut9Pw+YO6x9ELaCbDPWSQ6M3W387fhoyqU5C94jeonF9xKC/5ZmZgfSofhlNO+Tvlvypl7EcwVGBM5rbN4GuWS937JOSAj6t6NDj3jHHu8OnZOo5s9OlZ52tf5WtfwVjmB7bFfo5yLtjn82zziHUO31IoMOfTomfKkQD1igxGqpQkBIAhXqHHUAFRgSQ4iAQG6eXBemkIaGURprgs8O455f3YSfqcgFGBjZLJmN6+zARMZMMdA7mwviT7rYERbO+mFdPjMXRra05fhW0LNqyetQLOHrra8b4bmG7RD4OePnANOF92dEHWmpOgWncGZq3Yubqk6MLUiPo0IcE+hbYqnH8we2heSyZpXyDu3RbQv58D7gOI+Ffo3T2mZ7tvzxYfwjbllb6OFX4EVbwMc4W/fQEXbGWYKwjWPfMsgXmG0Dwdc9vIopcmJcxmzzApgExQGGKIPlIJ7PSmVwTpZEFacTB0K2LdC9aAt/mZ12YDtE3C9NMv6xIMh01vyAoTBzrp13xRtmz0A1jcPP3Y3gG+HYUM36b8+f3HY5sPwsa8qg3T1sCWiv2PGl8CfZnZuWAzznCbehxQuPMCTNx0EVI2nyletu63vMTb6TKoV2Gpw4xBKXMaU7mPpwtAXxUwsE8+cIADqOK+faPAuXO0c6uPYxOxr/dxrMai52fDirfM317BIYsoXzZiSxExF2K0EJhyRWZMx1OkYEyXGhAuJBE9qjheYYhlShgwV4QFagODCBY9SYhFGg3W8VlDJy+D14iJwgVY+gkVMvoDpcPGjU+6+3uh12F1WM1gs5gcPVa70waOXofT1Qe9LrfT1e8aGAR68NOxDHQY5kHAvGnaO89tPw5bZqzeOG0d7K488uzBB6DHCPMA8nhxN/cPel39QwOw4mQtxG+7CjG7azI3HN5QUnA2KwJqVUJg5uW/U/5LUvZvyeC+Kw4A+6bAoQOS/mo/6Ns/pnfvWHDuGNezxbcHO72NfvY1Po6V6BUc+1KCAZks4NlK+WAtEViLiKUAAxzTLqZixZOBYeSQhT5RBoa4QNDH0IBMmHVPG8DAjCwOsYUkgKd0lbf1Bentob3cELurY/9Uek8rmMsJ1g/tr67UQN2u3y6s2ALV85bvXVC1u2I17Fy+/rft1XD+2MWW+idajQ16+9BAvjYd9v/6LI5ndx7CkRXVO4q3wc0T9bouG1DHYe5XttczozTu46F9d9sgcedVCNl9a8KOi3OXrtozIxVup8qATdnvQRanuyIY+nYGDhzgufb5AOWLMXn3OMe2cXZa9LCf9qMZeYU/9eLF/mBdiG0Izci2uXzAomctFIA5X2DOFVpyJGZUcYYcDKlyAwZkwKIHsYHDhczOyMy6p5EyxBBqik2HoT3HvZ1qMuiimmP2Ggym53pQn5aOhgZ4sHrHraz5cDu++HpkIZwJm3kkeva+ySWwJa1084xlsKVs085Vh88euwMvn6t7nHhYUCFTLVNz9wwO9Dt0Fmh/8O7h1Ueg+2zp6ekHVP3w42bEAHPY9Oarz1B47BZE7qkJ33MrZf3ByuJCuJoeDJRyY4pfWy6PPbDp2i2jfPeMZWCzhy0f1j3fHtpMExrglnOYnTSxLmCUcq0lKGS+ZbbAMosxQ2TOEZmnSpgDb3LQo4oTAshEBcFOGiKGq1inDAIm3yCNMLhbHGHPLARPTbPXbCVfa45mNmbx6R9yOfSPHrZUrIW74dPuclVQz8usF+fBXUXhlbCSkxPmQ7Vq8dYplbA6d/XS2ZtXVx6EG9ef6Iy93/QNqlN3f5+xywBvH354WvcKOj/q7D19wGRKB1XZEsY/ZlN+a7bDppstELfnWtCBushdl4orlsGpqVFQn8z7R1Oa/8tCvnVdIPTvEVG+uxnYT2/zAzqIvM7fXuVLlmN0Qy/m2hcS7KQJbab5pEBgyReCOVdsniYxZ9FBemNKAOgTA3STFKCfEAiGKCXow5S64CDQKoJBIwoBLT9EJxvfW7QUvI/feB29BGU0/EYpezy0yntsllc7DjTEToe2sZNejE6CJ5yspyEl8CptzbPCXffnV8ONRdVHF+yFTXN3lBdtWr70AFy+/ERr6MWPcw+5gZ1MbBbrw9pHcHzX2X0bTsCdWw/UWhMw4bK1TBFT4TPs7kE40fgEVPuuKg42KA7cy1m1GarzJgHtsP9O+S9JOd3/3TyuY4sQXHs4fZTvOLLdz7mFA44NHPsaP3sVB2yVaBdc+yKebT4frPMEpFhonS0Cy0yRJU8MZnTkqTJzhsyUJjckky+9whCnBH1EMAlBowgGrTwENIJQ0PLDLUFJg1XbwPv6o7fPBZiR2b+NbYge7A6GXINd6sfFlffFifD2X3HvfpkMH+WzdLlbYOBws7vmla35PagbX724+xTunm86fqBm3+4rUHPrRbeBOka/pw/wM8FsMN26eA/WLd6xtGQrHD9+q71DB0z7psUBSya72WR/GfR2uNb6FnKO3lEcaJAebs7YeAC2FU6BOhX/H41pfu0LOD3biWuPT9+u4QNDzq3+PZs44FjHsa30ty3ngH0pz1bOsy/ARCEAa4kILEVC6ywRWGaIzblSMk1qzmJP6GHFCyCTUcXEEBtEwkNAHxyiU4QSKUG+oONF2sLSvJsPko5Or9sFg4MuN7a2tCemaqKtwVD/YPvnB+nFT3zj4f3P49/9MgnaFTP7V5wC7+ser8XjdXmJ2+vpJ1hEtWrno4ft0Pq0Q2dxImW3pw+G8PjwuCwGc82FWli9cHfFnJ1w5Oi99x+NgJS/XRuYo6N0w4VVeNBz78VHmHWqXl5dJzn2SLX1GKwrmQG1lHK6/8eF3N4dpG83Vryxjq3jyCY/x3oO2FdzbCswHXNJBc/GFvJcAVjnCIGO06OKmUI2Z0vIFCkK2ZxKR+jZoUI/MVA3XgH66CASEgLawJEqFpNuXjjxi7BGTvMeuki0Bq+rDzCxsSeaRg6nMTPYp+430yte+ifAh1/i3oyaDG3iaS+zV4H1bIv56Wer2gx2jM6OPnD1YxD09rqGAAXYx5zsY+857BXBYrDePF8PqxfuX1y0D44cbXj30QL/LmWChxXc/6CGsisPg480C048nrTjBFTNmwm1KsE/mjL8Oxbxe3fwwLnTx7FtjH3TOLIB0zF6Bce+kmtfzrMt5ZJyno0KmRmNaToWkgKqYjJdQlX8TSEbE1HFgSReqYthRAYRtlEoQjRS0i0kGm4EdPtGWqPzvGdvE4uFrWU8MAexJ6Zt8XDK9PA1WMzbTryOzCe/Tnw9Jgke8rNqw2bDrczKy/O2XN9wBOpP3Hx49yG8fdlutth7+93g8gz1IiOmw1KTZSZxs8F240IDrFx0YOGcajh4rOlNhxX+lPIw9xBp/dwNC288CjzSwDn1OHb3aVhSNhvu/Z3yX5fyp3JB304+OHf4oFdgD0LW+ztW88BexbdX8qlXVPDsi+hCFutcgQWNAgoYM8WWXAkM9wpsqdNlzDk9aseGiUoSF6SLUpKwIKJARw7R0VUsIdAtCAWNfwSox0VZo/O9l+qI3eoZ6gdmxSPIl2kXTMrO3sHWd2/nbYDHksynnHS4z8m6J8qDq8qiUzFlh1OWwv4Zq/aUb4UDWw/fuFL7rl0NNpcbswtSZjsGe4bFZLReu9gAy8sPlJVUw/4TTa8+WQGJsvfHn1KmEaWtSw2Lbj4IOFLnc7o1et95WFQ2B4ZT/rxY2LeDD87tPo7N4xwbfMkaf8dKHiBi+xI+tWNYwMwVxXRCj8wSE8wVORLa6U2VmDOlwBQys8fD6IaJAsYH6SKUoAkmbDvWSkM1IgYvDLrGhYN6dLQlIt97sZY4rOyy9SVlj2eA0J+Hd26vo8f14AVo1h1sSyiDFkleg2QW3AgoOhNZdiB+EWxTVaybXgUr5qxfuXTPwSM3ofWN1uwawp5y+PinhxhMliuXGmBZxYG5pdWw72TTq89WwB37X6T8pEsNSFl+uNbn9OPovRdgUVkJUMqNqOVFQud2AfRs9XXQcXo/cKzmsJdj2Zfy7Yv5toU8UkbrHnukguSLSa7UMk0CNCCjikElNyUGGFHIdEhICfoolDAKWalREp0sFLTiMI0gHLS8COgcHQbqX6MtYfneM3eJzULzAe2n8fcwoxQDAX/9DLM8et998l59AAPbr+kXH4NnBbuuZK09kFoJW9OXr81ZCytmb5s/Z3v58sNw9FLrm+4eOjjv7Qfm9LZbbzRdulwPFUur58w/AHtOtbzstAGTMv7T+I9+iZh+gQFsyz2DT9RqmF9zX3qsdtzpx1F7zkF5aQn8nfJflXJDmt+HMn7PZhHD37HBx7HWD+yrOFj0aN2j6Y1vW8Bc9zaXbysWWKlXiAizB7HkoBejIzPtIk0GJroEIMBIe5BAY4wS9GgXoUHAHt7USUJBK0KjCAetP1GPjoDuX2OsyunePReIRj98tAB/D7spYY4ZjcxeaKouuoYI0D3oiPyA12gffNYF1ruv2k+1PNh9E85UHts0eydUFuwqK9lTXH4Ilm67Vv9C2zOABtQP7BkQpHzxSh0srqyevfAg7Dr78HmXA3Bv495lmhV+H+ZXou6BRkOrX+OH9zDjci3vZMOYc63Re87AsrI5MJzyu7nYYYugZ6N/z3of+xpfcGCzt5S5kIXmCt7INoQK2UpVLCLTMVeI2Som6VIseiQxwIRCxh5kfKAxSgl6rHjBwaAJCAL2zLQWVcyNAI0v6R4VBeqfo0zCzIGqA+Bt7x7ODn8StUTmf8yE6x7CoGA3P3ve+64dPFYrk7iLTmzTAjlEB4FtXldXL7y99+7ohguwrGjP/PmHChcfhQVbr9983GXBjoeZW9ha1hoNF67WwaIVB2YtPgjbzj98pnYAJmususzC+7uUewfdcP3lc0g7d9v3TMuoc23jd56ElXNnAc3LDal+r2bzjVVCoG3I2nH2lT7gWO5Pm2lmP22fz0MVkzl0YNM6spMeXvToAlkpSaUqJpMDjPEKYyxdxWKICALd1800Q4CIw7RUxRGgGUe6/xUN6p+iu8cl2grWwtBT7LD7yci8xZb0AHZcQ65eddeDyo1vVu2ErjPX9A9bwfT+na1LDQ6N3qExmjvI2wftx7ZdhiXFe8oWHp1ZcQLmbbt2/fFns2t4OmRT1hgN567Xw4JVB2csOQRbLj5q0zjg36VMbG4XnGh9DHEna0afeTjq/NP4bUdgQ1E20A67PsX/SR5Xu0wG9rUC+2of2wpfoKNCi3nAHqS3FjNQyLOEdGBzupigikeOCrEDsimBMUlhjFNQo4hkTkuHKrXK4as3dbIQ0PJCCSecrWLN2EhQ/0y6f4zp+DGuO6EUButeeXvcZLhfDB9sZHbb/a729sb0OfWyVBI87f6UhdBWuf3Z7uPw8tT1ttM3m4+R81tOby7dA4sLdheVHMqvOAkLdtfUvtE7MCSzkxzzEOg2G8/crIeyNYdyKw/DpiuP27RO+HPK7NjzwWSGjfeaIPDIzdEXno099yRh817YUZACdD3G3yn/FSnXpfi3ZPp2lEnAukpsW+lrXe5HljAduZxnZbYh1CvYdpEvtOSKvvQKkjF8ZtqUhHbMQLsYr6DDm+HMyf/gIB0dsiDsIQstN4xg0fOJBM1oov4pinwf8/G78d0Rs2Hw3H2v1krYFkh/HKXcT9fPuobaOx5Omvl89CR486+kNk461CqzL46fBUcTi6vT5++aWgGbsleszt0EFbN2z513eN7qi7DtYltbd08fHvTMG3uEXm01nb7VAKXrfstZfhg2XG1t1TsBc/tIviMpMxo61DDvWiOIjtf/euG576mW1NUboDo3DuqSuf+oTfZrSB33ZrYITMulliqOdRmxVHCtC/lkHt9Wgp00M8DNFFrzELGYNiC0B2GkSamK2cuQJ2K0CDDGopADDZFKQ2gQXcUSFKQNCGY30xrspIUhWv9Q4hOuGYtCjtD8GgldP0SR75By3EdJDjirjnnfdpORdW+klpnz/+87nmfOf81Jg3ej0l76ZEEzf+ptRT5cDC86Hl+6P2UxbM5asSZvC1QWVy9ZcnL3iUfQ/MmpG/Aiu5H7j86YqK3m07cbYd6Gw9lVZN211sd6J3yTMjvGDX/jb09eQ/zZezDu7MNRF56JD93IrVgCJ6dGQH0S5x/1yf6NKf7PcgWgKZdYlwstS3hgRRXPF5B5QtrsDQ/INFcwXYKRIQUTCpm5QNYwWc5eT0/XyEYG6tlCVgaTgFAtRjcJHUEmfmFkXLhmdAR0/ysSun6Ihs+o5e8nvB2XBh0pS923n4C3B5thmuEwJgO7XnnNlr4rjT0rD4M2c+Xr6HnwMGR2Q8Q8uBW76HxCxeGMFbArb+2e8mr4bduVK1faHr02gs5Fz4igmmR+NJtfl9V2ru4RLNpxOn/DKdh06+ljgxOYlNl8CX6NPg9ZWvsYhMdr4efzbb5nHk7YfGBpyUy4lBEE9Ul0ZS09P/JxFh86ikWWpVLrYiFZKLCWicA2T2ydw0zH7BHkHBrdLFkyMKcTUwo203Ly9YqsQAzIdJA+KFinIFoZGkUodPOIxhcdObx7THj3rxiQI+h5ZL9EdH4fBZ++j2n/If71L0nwVJZn3HoGPO+7mK2Dm51YB6mi6eoAb5/b81EP7puPbcfqQL/rhnbjJVBvvtqx/car6rvw9Ezz69pX8OFZp97gdLiGAM2eLcuRjk+1bHK5H3/Sw6nGV9X3yKX3hrdONzBVz87LNFqgiZsGXJB6vhbGnGiGny88Fx++XVCxZF9eItxMlQFzDvvvlP+ClOlZvsnc+6nkVR7fsFBmKReBbaHQNg8Ri2wlYkuhyDJTAtY8KXZ6lqlSS5YczGkBRBU4fP6f9tOMaKx7wXomYm1ACHTT4c1QUPNIt084Gc08G5KeEEk6v4+GT9/Hfvhx4ptfVdDKnfo8cxn0XWz02nqAveoFEWPDh6zpD2f3IPZ+elIUaJ3edhP5aPZ+sg5p7DBo7h3sccOAawDfz56vY7sq0+4pO7bvuxB0/wB8trs6egbgc9+A1eMB7C/ZOYT9964B5yuDEQKP3IUx557AuNMPo3YcXzVn+oUpoXBPJYbhlPF/TSoOPJnCbS8Q6MuEYC4TWlDaMFtkniky54nJdIlpqtiU+c3xCuaQBXsZsiGONnvADHDBhiA6vKlBFctCusUhakEYdHGIekwE+Vd4988RoP4xCj5/Px46fpjw/peEV2NSodU/q0WRB+rKA97Xn8DT3w906GD4dD1aKlNaNCZQaIN03orZLrKXS1CB0o6DDYjp6fRQACZWSpnt9ew/wHf2ewcZSJxOZuEHscsAvpH5oUA/VOewHrn/BPyPtcDYc60grb46ZcXa/XmT7qRJoV4lgIZkuuaTngfRlMyBZpX/06m8riIRmOZKzEVisBSIrSjkPEaO1DyVtnnGFEainExWGCcQJl+iZS6xMASGYjTWYMWThHYLwrq54cQvgowiauT7QyR0fR8NHd/HQftPk97+K/n56FRo9cl4wJsCzVFFnbvOwpDaCBjk2IyQMjOGUcpMZIjEzV6FNJwGdQWqvpG2AOw9MPxlpq4pdCZ9OunFHBYZop8yXPJIvx8QNB3q9gzpevvgzvtPOUevwM9nnoDvySZI3Lh36ZwZZ7PC61PEwFyy/HfKf3HK9NofhPMwjfs2TwTds6VGBqWcL7FMl4I5W0bPT0+XjjwxJABMkwJNcUowxtAhC8C6p1eG6LANwYDMHKfv5oWxp0K6fRi/RIL6h4iu7yKh87sY+PhjPLz/OeH1rylPx6TDg3EZ9/2zoE6S8zBnBWjO3AG31kTNmYmVfftyY4iJGNB+2V0Di42STZmJkk2ZcmS/xH5yOGIGe9aAvZoWsEk09fVBfYcaFlytVx66BqPPPgTFvnMwZ/HCg9Mn3kgLaFCJCHPtPeIdTvlL1s0qbmsGHz7kinWzpGDMR0eWmJAvTJEbUcipUmOyDNjn3jA7PSXQhSyYkWlMDtYrQnXyUC2GCvZsEzdc6xtBxkaC5iei/h4RR0Pnd+MBVcwUctLL0WlPxmXCfb8pTdxpUCuafjO8AOqK10PnjWan2jDkpqC/vjHF7KHJg9Jkc2TrESU/kjJV8UjK9Bm2xpkyH/4Se4Pp+ASPA+aqZ7fF5Wxo/wSV1+sh9PC1cSfqQXLwEqSvXAObCtKupAfcU4mY14xhXw+Gy1y//E3KTcn8piRui4oDT9I47dNEoJkuMU6XGqbKSaacrvROlhoTZGCYQOiQRbQSDBG02aP9HrYh8lC9NEwnDEMVM4UcrvGJgG7sQeDHSFAj4n+Oh8/fTYD3P0+GN6NUz8emP/adAs3caY38HLgryrmumAGXYouhtnTL+0t1/Qarh55QwzxVgeIguMGmDMiOLWSUOMJi+sa/TZk+z569pavHhwh6CZs+fqalpwfuv+9Ycb0BYo7cAP9TjaNOt0DGmg2wvjAdzmUF36UVD/U78oxrxpeU6bNNSYLmJD76BrQk+7WlcuHjFIlumtwwJQCMGQHM8QqZCSU8aXinZ4pVsu3YEB5kCAkGvSLYIAs1iCN0gnANNwy6fcPVYyOg+9dIYNux+p8xnf8RBx3fTYTXvyTAy9GpbT6ZD/ymQiMvu16YC3fEedcVs+CikpyPLblcsuHByes91KOZK0ARBlPNSJRtBQiI+Yj2acPtlzm4823Kw3cDey6Rgdy/3DHso6Pb0XO99RVUnLoZe/AacI/Xw9gzLYLDNVBVkgsoYahjBrY/+zvlvyxl+hrzHKkkel0e9guNKv8HyX7wTMX5lCXVZgWAPkVuSJQaJtM2D4yxgXSoPiqQegXTLuipevRsvWCDNMwgjNAiYn+CPYgaQwVg0YPvSNd/xHz+5wTo+GEivBqVBM/Gprb6Zt7nTINGQW6dOB9uS2deC5wNl0OL4UJM6ZHE+Qfylt3aceJD4zNw6u1ubOdcdFEBTRVMtOzjnTBNhfyun9CXKEpqM2ysQ3SOy+OG3sFeS68T9jc8yj1xE5T7bvgfqQefE40gPHglYf0WODktHO6mCIGN7s9GUmawk0Z9Mgcakv2bk/3gQZLfUxXvQ6oEulQybZJcP1mhjw8kMez19F8WvSD2mb10EFkUquOHaTnhqGK2kLt+JWosej8h3yjo/I/xHd/Hw4efJsOLMSnwxCf9kf+UJl421Iny7krzoSag4ErwHLgUUQoXxi84NmH+7onzNqnmn1i6B1rO1X98/hn0entv/yD0D9F5TyY/qmv2ohYm9OFqJRQ9BpIBYCa8Acdgv6bXDs813ecfv4SkA5fk+6+B34G7/EN3IHzvWZi6et3yudOhJk0EqOL/rJBhpGMM92n21dHoJUygMZlgjr6fxH2SJIDXSeL2BGnnpADNhEDQjie6SCUGZHZG1soZkhCtkDlUj5THRUDX6IiuX6LIT9Gg/mcsfP4uvv3HyfD2lyR4Oi4NHvtl3udmNwhz4a4k75Z8FlwLLLwYOgfOR5XBmfGLjk1YfGDS4l1JSzanL4OtBesPrTkM18/dffz4Bbz58LFLq7E67NA3OPx6Dl+7BG54BvvcLqvTrjEb4L1WDc1v351/2AYrL9Rk7D0LsuqbooO3IKD6Wvzmg1C0ZAnsLky/PCUE6lRcGA7wm2S/9eeUhyP+AtWNNtKcSB4lCZ8lil9Pkn6Mk8PnGKKOUHSHKAm9XEgwaEUhWkGYjkuHhNh23PlrZOfPUeTHaFD/Mw4+fz/p/c+J8PpXFTzxTYcH/llN/OxaUS7cls2oUcyCa8Gzz4cXw5noMjgRW34ofsmehModqqotaathfdbqlblrSOnmVZXbYe++E+cu1NypfQCPnr599vYzPH/f+ex95/P2Lnja3tX0+v21R22Hb9fC+nPXoKj6QubeSzBhz5Wg3SR4z4UJmw/C9BVrlpbNhr35iXApM4h5MUB6ohn5JtM/+zvl/52Uv6pn4Kvs69QBBuqWRH7rZOGLeDG8iSXt0fJP4YHwWanslAUBc2lhiBbrng96RTh0/hL5+cco8n0MdH43AT7+OPnNL0nwYrQKHvmlQwsnq16QfVecCzUB+TeUBXA5tOhsRAmcjCmDo3Hl+ycv2568YkvKqo2pq2FdxtqV2ethSf6GsoJ1MHfOutLSjfMXboG5izbPKd8Cc5fvmr+2ei6jcN3+3LV7stbsSllNEtcfgpgNpyI3X4So7Zdid56FrKp1ZfNLYNus1NPTIuFmuhyw1tUmc2FkGftdrH8wkjJrOOvfY5bEL0E3I+gk/sNEAZnMhycTRS/Gy+BthKJDqQS1JFiLnQidDYnQjI4C9S9R6p9ioOvH8dD+40R4j4hHpcDzsWnwwB+FnN4snFYnzr0jz4cbyllXQwvhQkTxqei5cHR8GRyKX7QvacnOlMptaSs3Za6FtVM3VOVsgqX5WxcVbofSop0lxTsL55EZpTtz5pOpC3dnVVSnLzkIquW/TV51NG7tcSQL4zedhkkbTmSs3AsFS9YsKp0Lu/ISjk+LgisZijupYqhPERB6OZGR10NkUvov/D7l/xw7frAvC/gHqO6HE0XQFid9GRMA78IDPwYFfQwM/igL6ZCEwUdR+EdBJOFHwVtRHLwWT3wlTYBn8kR4HJQELSHJjWFptZHpcDsmoyY2C65NmHJxYjacm5wLpxNnnFDlH06deSi14EBGEezNmrtzailszZm/OW8RrJ+xeM3MxVUFZNnsxRVFZFFxxfySZfPmLofi0qrZC1bNKl89a/EamFO+AuaXLqgqmgXb89OPZMfCjTQZ+5pE9Noif4rlv+nvlP+PpExrI6MlUXA/QQgPJgkR+qN4cesEaVusjIyXt8UEkGgFtI4PIrHBrXEh8DguFO7Hk5aJoU2TQhsmk7rE0NrEMLibFH4rKQJqkiPhZnLU9ZSoq6nRV1Kir6TGwKW08RfSY+Fcety5zHg4mxV/Zkr8qank+NQJx6bFw9Fp8UeyJx3Ongy/5Uw+lDPpt5wJR7Nj4dSUaLiQEXolPRAQ7q0UMdQxxyVGDk38MZb/pv8fKUMSC42bXqmHXqSYXqpY0JQkbEkckSCA5gQhSSRNiaLmRAlJIE2JI5IkDcliqKeDW2KiEteqJHCPQS9vqvqdOynDbqukt1NkcId5du4thJUmq0mT3fxKPoxOyklupYnvpBD2OdN1CDSZXriZyZT2w1TCrD9l8t+VzP1/VWyWTVZNKDYAAAAASUVORK5CYII=",
            width=100,
            height=45,
            fit=ImageFit.CONTAIN,
        )], alignment=MainAxisAlignment.END)

        self.appbar = AppBar(
            leading=img,
            leading_width=120,
            title=Text("Simple.Kit"),
            center_title=False,
            bgcolor="#c55b36",
            color="white",
            actions=[
                PopupMenuButton(
                    items=[
                        PopupMenuItem(text="Настройки"),
                        PopupMenuItem(),  # divider
                        PopupMenuItem(text="Инфо"),
                        PopupMenuItem(),  # divider
                        PopupMenuItem(text="FAQ"),
                        PopupMenuItem(),  # divider
                        PopupMenuItem(text="Обновить конфигурацию")
                    ]
                ),
            ],
        )
        
        self.navigation_bar = NavigationBar(
                destinations=[
                    NavigationDestination(icon_content=Icon(name=icons.APPS, color="white"),selected_icon_content=None),
                    NavigationDestination(icon_content=Icon(name=icons.HOME, color="white")),
                    NavigationDestination(icon_content=Icon(name=icons.CHAT, color="white"))
                ],
                bgcolor="#c55b36",
                on_change=self._nav_handler
            )
    
    def _nav_handler(self, e):
        routs = ('/', '/', '/')
        self.page.go(routs[e.control.selected_index])    

class DocumentFilterHeader(Container):
    def __init__(self):
        super().__init__()

        btn_doc_filter = ft.Dropdown(
            width=130,
            text_size=18,
            text_style= TextStyle(weight=FontWeight.W_700),
            border_width=0,
            value='Все',

            options=[
                ft.dropdown.Option("Все"),
                ft.dropdown.Option("Реализация товаров и услуг"),
                ft.dropdown.Option("Инвентаризация"),
                ft.dropdown.Option("Заказ клиенту"),
                ft.dropdown.Option("Сбор ШК"),
            ],
            
        )

        btn_status_filter = ft.Dropdown(
            width=150,
            text_size=18,
            text_style= TextStyle(weight=FontWeight.W_700),
            border_width=0,
            value='Все',

            options=[
                ft.dropdown.Option("Все"),
                ft.dropdown.Option("К выполнению"),
                ft.dropdown.Option("Выгружен"),
                ft.dropdown.Option("К выгрузке"),
            ],
            
        )

        filter_row = Row([
            Column([btn_doc_filter], expand=1),
            Column([btn_status_filter], horizontal_alignment=CrossAxisAlignment.START, expand=1)
        ])

        # Configure the properties of this container
        self.content = filter_row
        self.padding = Padding(5, 0, 0, 3)

class FirstLineCard(Container):
    def __init__(self, status_text='', doc_type_text=''):
        super().__init__()
        
        # Popup Menu Button
        popup_menu_button = PopupMenuButton(
            Icon(icons.MORE_VERT, color=colors.BLACK87),
            items=[
                PopupMenuItem(text="Удалить"),
                PopupMenuItem(text="Очистить данные пересчета"),
                PopupMenuItem(text="Отправить повторно"),
            ],
            tooltip='показать меню'
        )

        # Columns for the Row
        left_column = Column(controls=[Text(status_text, color=colors.BLACK87, size=12)], expand=1)
        
        right_column_content = Row([
            Text(doc_type_text, color=colors.BLACK87, size=18),
            popup_menu_button
        ], alignment=MainAxisAlignment.END)
        
        right_column = Column(controls=[right_column_content], expand=1, horizontal_alignment=CrossAxisAlignment.END)

        # Setting content for the Container
        self.content = Row([left_column, right_column])
        
        self.padding = Padding(3, 0, 0, 3)

class DocumentCard(Container):
    def __init__(self, status_text, doc_type_text, doc_num, company_name, location):
        super().__init__()
        
        self.first_line = FirstLineCard(status_text, doc_type_text)
        
        self.doc_num = Text(doc_num, color=colors.BLACK54, size=18, weight=FontWeight.W_700)
        self.company_name = Text(company_name, color=colors.BLACK54)
        self.location = Text(location, color=colors.BLACK54)
        
        self.content = Column(
            controls=[
                self.first_line,
                self.doc_num,
                self.company_name,
                self.location
            ],
            spacing=0,
        )
        
        self.bgcolor = colors.WHITE
        self.border_radius = border_radius.all(1)
        self.padding = 10
        self.shadow = BoxShadow(
            spread_radius=1,
            blur_radius=1,
            color=colors.BLACK12
        )

