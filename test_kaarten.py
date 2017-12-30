from kaarten import Treinstation
from kaarten import Winkelcentrum

def test_kan_een_treinstation_kaart_maken():
    kaart = Treinstation()

    assert kaart.naam == 'Treinstation'
    assert kaart.kost == 4
    assert kaart.uitleg == '2 dobbelstenen gooien'

def test_kan_een_winkelcentrum_kaart_maken():
    kaart = Winkelcentrum()

    assert kaart.naam == 'Winkelcentrum'
    assert kaart.kost == 10
    assert kaart.uitleg == 'verhoog munten'
    assert kaart.verhoog_met == 1
    assert kaart.verhoog_voor == ['koffie', 'huis']

