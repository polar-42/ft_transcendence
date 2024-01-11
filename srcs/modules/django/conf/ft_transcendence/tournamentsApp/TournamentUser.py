from .EnumClass import UserState, UserPosition
from battleshipApp import ColorPrint

class TournamentUser():

    def __init__(self, socket, sockUser, username, userId):
        self.Socket = socket
        self.SockUser = sockUser
        self.Username = username
        self.UserId = userId
        self.Status = UserState.Waiting
        self.Position = UserPosition.InTournament
        self.Socket.accept()

    def SendMessage(self, message):
        if (self.Position is not UserPosition.InTournament):
            ColorPrint.prYellow("Warning! User {username} : Can't send message \'{messageObj}\', user is away.".format(username=self.Username, messageObj=message))
            return
        (self.Socket).send(message)
