
class TestDobbelsteen():
    def __init__(self, worpen = [ 1,2,3,4,5,6 ]):
        self.worpen = worpen
        self.pos = 0
        self.laatste_worp = None
        self.volgende_worp = worpen[0]

    def worp(self):
        self.laatste_worp = self.worpen[self.pos]
        self.pos += 1
        self.pos %= len(self.worpen)
        return self.laatste_worp
