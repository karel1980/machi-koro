
kaarten = []

class Worp:
    def __init__(self, min, max):
        self.min = min
        self.max = max

    def label(self):
        return self.min if self.min == self.max else "%s ~ %s"%(self.min, self.max)

class Treinstation:
    def __init__(self):
        self.naam = "Treinstation"
        self.worp = Worp(8, 8)
        self.kost = 4
        self.uitleg = '2 dobbelstenen gooien'

class Winkelcentrum:
    def __init__(self):
        self.naam = "Winkelcentrum"
        self.worp = Worp(9, 10)
        self.kost = 10
        self.uitleg = 'verhoog munten'
        self.verhoog_met = 1
        self.verhoog_voor = [ 'koffie', 'huis' ]

