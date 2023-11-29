class PongGameManager:
    def __init__(self):
        print('__init__ called')
        self.games = {}

    def create_game(self, game_id, player1, player2):
        # Create a new game instance in memory
        print('create test called')
        self.games[game_id] = {
            'player1': player1,
            'player2': player2,
            'ball_x': 0,
            'ball_y': 0,
            # ... add more fields as needed
        }
        return self.games[game_id]

    def get_game(self, game_id):
        # Retrieve the game instance from memory
        return self.games.get(game_id)

    def delete_game(self, game_id):
        # Delete the game instance from memory
        if game_id in self.games:
            del self.games[game_id]
