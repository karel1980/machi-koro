from kaarten import Treinstation, Winkelcentrum
from random import randint
from dobbelsteen import RandomDobbelsteen

class Spel:
    def __init__(self, namen_spelers=[], dobbelsteen=RandomDobbelsteen()):
        self.spelers = map(lambda naam: Speler(naam), namen_spelers)
        self.huidige_speler_num = 0
        self.laatste_worp = None
        self.dobbelsteen = dobbelsteen
        self.aantal_worpen = 0

        # dobbelen, opnieuw dobbelen, munten afgeven, munten krijgen, 
        # kopen

    def huidige_speler(self):
        return self.spelers[self.huidige_speler_num]

    def dobbelen(self, aantal_stenen):
        if aantal_stenen < 1 or aantal_stenen > 2:
            raise Exception('dobbelen_moet_met_1_of_2_stenen')

        if self.aantal_worpen >= self.huidige_speler().aantal_toegestane_worpen_per_beurt():
            raise Exception('je_mag_niet_opnieuw_dobbelen')

        if aantal_stenen > self.huidige_speler().aantal_toegestane_stenen_per_worp():
            raise Exception('je_mag_niet_met_2_stenen_werpen')

        self.aantal_worpen += 1
        self.laatste_worp = [ self.dobbelsteen.worp() for d in range(aantal_stenen) ]

    def einde_beurt(self):
        if self.aantal_worpen == 0:
            raise Exception('einde_beurt_kan_pas_na_dobbelen')
        self.huidige_speler_num += 1
        self.huidige_speler_num %= len(self.spelers)
        self.aantal_worpen = 0

class Speler:
    def __init__(self, naam):
        self.naam = naam
        self.kaarten = [ Treinstation(), Winkelcentrum() ]
        self.munten = 3

    def aantal_toegestane_worpen_per_beurt(self):
        return 1

    def aantal_toegestane_stenen_per_worp(self):
        return 1
