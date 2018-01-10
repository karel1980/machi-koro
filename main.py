from Tkinter import *
from spel import Spel
from dobbelsteen import RandomDobbelsteen

class BuyButton:
    def __init__(self, container, kaart, handler):
        self.button = Button(container, text="Kopen", command=handler)
        self.kaart = kaart
        self.button.pack()

    def update(self, buyingAllowed, currentPlayer):
        self.button['state']=NORMAL if buyingAllowed and currentPlayer.munten >= self.kaart.kost else DISABLED

class BuyActionBuilder:
    def __init__(self, handler):
        self.handler = handler

    def createButton(self, container, kaart):
        return BuyButton(container, kaart, lambda: self.handler(kaart))

class CardListFrame:
    def __init__(self, container, kaarten, actionBuilders=[]):
        self.outer = Frame(container)
        self.outer.pack()
        self.kaarten = kaarten
        self.actionBuilders = actionBuilders

        self.build()

    def build(self):
        self.frame = Frame(self.outer)
        self.cardActions = []

        for kaart in self.kaarten:
            kaartFrame = Frame(self.frame, width=200, height=200, bg="red", borderwidth=20)

            kaartFrame.pack(padx=10, side=LEFT)

            Label(kaartFrame, text=kaart.naam, wraplength=50, bg="red").pack()
            Label(kaartFrame, text=kaart.uitleg, wraplength=50, bg="blue").pack()
            Label(kaartFrame, text=kaart.worp.label(), wraplength=50, bg="red").pack()
            Label(kaartFrame, text="Kost: %s"%(kaart.kost), wraplength=50, bg="red").pack()

            for actionBuilder in self.actionBuilders:
                self.cardActions.append(actionBuilder.createButton(kaartFrame, kaart))

        self.frame.pack()

    def update(self, canBuy, currentPlayer):
        self.frame.destroy()
        self.build()

        for action in self.cardActions:
            action.update(canBuy, currentPlayer)
        
class PlayerFrame:
    def __init__(self, container, player):
        self.outer = Frame(container, width=800, height=10)
        self.player = player
        self.outer.pack()

        self.build()

    def build(self):
        self.frame = Frame(self.outer)
        self.frame.pack()

        self.cardListFrame = CardListFrame(self.frame, self.player.kaarten)

        Label(self.frame, text=self.player.naam).pack()
        Label(self.frame, text="Munten: %d"%(self.player.munten)).pack()
        self.frame.pack()

    def update(self, is_current):
        self.frame.destroy()
        self.build()
        self.frame['bg'] = "green" if is_current else "white"

class Gui:
    def __init__(self, spel):
        self.tk = Tk()
        self.root = Frame(self.tk)
        self.spel = spel
        self.spel.luisteraar = self

        self.createCenterFrame()

        self.playerFrames = []
        for speler in self.spel.spelers:
            separator = Frame(self.root, height=2, bd=1, relief=SUNKEN)
            separator.pack(fill=X, padx=5, pady=5)

            self.playerFrames.append(PlayerFrame(self.root, speler))

        self.updateGui()

    def dobbelsteen_wijziging(self, nieuw):
        self.dobbelsteenLabel['text'] = str(nieuw)
        self.updateGui()

    def kaart_gekocht(self):
        self.updateGui()

    def einde_beurt(self):
        self.updateGui()

    def munten_verdeeld(self):
        self.updateGui()

    def debug(self, *args):
        print args

    def createCenterFrame(self):
        frame = Frame(self.root, width=400, height=10)
        Label(frame, text="Machi Koro").pack()

        buyActionBuilder = BuyActionBuilder(lambda kaart: self.spel.koop_kaart(kaart))
        self.centerCards = CardListFrame(frame, self.spel.beschikbare_kaarten, [buyActionBuilder])

        self.dobbelKnop1 = Button(frame, text="Gooi 1 dobbelsteen", command=lambda: self.spel.dobbelen(1))
        self.dobbelKnop2 = Button(frame, text="Gooi 2 dobbelstenen", command=lambda: self.spel.dobbelen(2))

        self.dobbelKnop1.pack()
        self.dobbelKnop2.pack()

        self.dobbelsteenLabel = Label(frame, text="[*dobbelsteen*]")
        self.dobbelsteenLabel.pack()

        self.verdeelKnop = Button(frame, text="Verdeel munten", command=lambda: self.spel.verdeel_munten())
        self.verdeelKnop.pack()

        self.eindeBeurtKnop = Button(frame, text="Einde beurt", command=lambda: self.spel.einde_beurt())
        self.eindeBeurtKnop.pack()

        frame.pack()
        return frame

    def updateGui(self):
        self.updateButtonStates()
        self.updateCenterCards()
        # todo: update player cards
        # todo: update center cards
        # todo: update player scores
        # todo: update current player

        self.updatePlayerFrames()

        self.root.pack()
        self.root.update()

    def updateButtonStates(self):
        self.dobbelKnop1['state']=NORMAL if self.spel.kan_dobbelen_met_1_steen() else DISABLED
        self.dobbelKnop2['state']=NORMAL if self.spel.kan_dobbelen_met_2_stenen() else DISABLED

    def updateCenterCards(self):
        self.centerCards.update(self.spel.aantal_worpen > 0 and not self.spel.kaart_gekocht, self.spel.huidige_speler())

    def updatePlayerFrames(self):
        for frameNum in range(len(self.playerFrames)):
            self.playerFrames[frameNum].update(frameNum == self.spel.huidige_speler_num)

def build_gui():
    spel = Spel(["Elsbeth", "Karlijn"], RandomDobbelsteen())
    gui = Gui(spel)
    return gui

def main():
    build_gui()
    mainloop()

if __name__=="__main__":
    main()
