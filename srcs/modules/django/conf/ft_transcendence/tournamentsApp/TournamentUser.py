from .EnumClass import UserState

class TournamentUser():

    def __init__(self, socket, username, userId):
        self.Socket = socket
        self.Username = username
        self.UserId = userId
        self.Status = UserState.Waiting
