from random import randint

class RandomDobbelsteen:
    def __init__(self):
        self.laatste_worp = None

    def worp(self):
        self.laatste_worp = randint(1, 6)
        return self.laatste_worp

