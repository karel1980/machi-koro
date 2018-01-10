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
        self.heeft_gekocht = False
        self.beschikbare_kaarten = [ Treinstation(), Treinstation(), Winkelcentrum(), Winkelcentrum() ]

        # dobbelen, opnieuw dobbelen, munten afgeven, munten krijgen, 
        # kopen

    def kan_dobbelen_met_1_steen(self):
        return self.aantal_worpen < self.huidige_speler().aantal_toegestane_worpen_per_beurt()

    def kan_dobbelen_met_2_stenen(self):
        return self.kan_dobbelen_met_1_steen() and self.huidige_speler().aantal_toegestane_stenen_per_worp() == 2

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
        self.luisteraar.dobbelsteen_wijziging(self.laatste_worp)

    def koop_kaart(self, kaart):
        if kaart not in self.beschikbare_kaarten:
            raise Exception('deze_kaart_is_niet_beschikbaar')

        if kaart.kost > self.huidige_speler().munten:
            raise Exception('huidige_speler_heeft_niet_genoeg_munten')

        self.huidige_speler().munten -= kaart.kost
        self.huidige_speler().kaarten.append(kaart)
        self.beschikbare_kaarten.remove(kaart)
        self.luisteraar.kaart_gekocht()

    def einde_beurt(self):
        if self.aantal_worpen == 0:
            raise Exception('einde_beurt_kan_pas_na_dobbelen')
        self.huidige_speler_num += 1
        self.huidige_speler_num %= len(self.spelers)
        self.aantal_worpen = 0
        self.heeft_gekocht = False

        self.luisteraar.einde_beurt()

class Speler:
    def __init__(self, naam):
        self.naam = naam
        self.kaarten = [ Treinstation(), Winkelcentrum() ]
        self.munten = 5

    def aantal_toegestane_worpen_per_beurt(self):
        return 1

    def aantal_toegestane_stenen_per_worp(self):
        return 1

