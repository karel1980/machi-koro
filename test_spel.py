from spel import Spel, Speler
from testsupport import TestDobbelsteen
from nose.tools import assert_equal, assert_raises

def test_spel_begint_met_spelers_met_gegeven_naam():
    spel = Spel(['karlijn', 'elsbeth'])
    
    assert_equal(len(spel.spelers), 2)
    assert_equal(spel.spelers[0].naam, 'karlijn')
    assert_equal(spel.spelers[1].naam,'elsbeth')

def test_spel_begint_met_eerste_speler():
    spel = Spel(['karlijn', 'elsbeth'])

    assert_equal(spel.huidige_speler().naam,'karlijn')

def test_speler_heeft_een_naam():
    speler = Speler('karel')

    assert_equal(speler.naam,'karel')

def test_nieuwe_speler_heeft_2_kaarten():
    speler = Speler('karel')

    assert_equal(len(speler.kaarten),2)

def test_nieuwe_speler_heeft_3_munten():
    speler = Speler('karel')

    assert_equal(speler.munten,3)

def test_spel_initieel_geen_laatste_worp():
    spel = Spel(['karlijn','elsbeth'])

    assert_equal(spel.laatste_worp,None)

def test_spel_dobbelen_lukt():
    spel = Spel(['karlijn','elsbeth'], TestDobbelsteen([1]))

    assert_equal(spel.laatste_worp,None)
    spel.dobbelen(1)
    assert_equal(spel.laatste_worp,[1])

def test_spel_kan_niet_dobbelen_met_0_stenen():
    spel = Spel(['karlijn','elsbeth'], TestDobbelsteen([1]))

    with assert_raises(Exception) as ex:
        spel.dobbelen(0)

    assert_equal(str(ex.exception), 'dobbelen_moet_met_1_of_2_stenen')

def test_spel_kan_niet_dobbelen_met_te_veel_stenen():
    spel = Spel(['karlijn','elsbeth'], TestDobbelsteen([1]))

    with assert_raises(Exception) as ex:
        spel.dobbelen(2)

    assert_equal(str(ex.exception), 'je_mag_niet_met_2_stenen_werpen')

def test_spel_eind_beurt_verandert_huidige_speler():
    spel = Spel(['karlijn','elsbeth'])

    assert_equal(spel.huidige_speler().naam,'karlijn')

    spel.dobbelen(1)
    spel.einde_beurt()
    assert_equal(spel.huidige_speler().naam,'elsbeth')

    spel.dobbelen(1)
    spel.einde_beurt()
    assert_equal(spel.huidige_speler().naam,'karlijn')

def test_spel_einde_beurt_enkel_na_dobbelen():
    spel = Spel(['karlijn','elsbeth'])

    with assert_raises(Exception) as ex:
        spel.einde_beurt()

    assert_equal(str(ex.exception),'einde_beurt_kan_pas_na_dobbelen')

