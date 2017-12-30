
kaarten = []

class Treinstation:
    def __init__(self):
        self.naam = "Treinstation"
        self.kost = 4
        self.uitleg = '2 dobbelstenen gooien'

class Winkelcentrum:
    def __init__(self):
        self.naam = "Winkelcentrum"
        self.kost = 10
        self.uitleg = 'verhoog munten'
        self.verhoog_met = 1
        self.verhoog_voor = [ 'koffie', 'huis' ]

