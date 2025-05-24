CREATE SCHEMA `dice-prod-db` ;

CREATE TABLE `dice-prod-db`.`users` (
  id VARCHAR(128) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  birthday DATE NOT NULL,
  gender ENUM('male', 'female') NOT NULL,
  description TEXT,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  INDEX `idx_users_deleted_at` (`deleted_at`),
  UNIQUE (`email`, `deleted_at`)
);

-- Add totp_secret column to users table
ALTER TABLE `dice-prod-db`.`users`
ADD COLUMN `totp_secret` VARCHAR(255) DEFAULT NULL,
ADD COLUMN `totp_enabled` BOOLEAN DEFAULT FALSE,
ADD COLUMN `backup_codes` TEXT DEFAULT NULL;

CREATE TABLE `dice-prod-db`.`user_photos` (
  id varchar(128) NOT NULL PRIMARY KEY,
  user_id varchar(128) NOT NULL,
  position INTEGER NOT NULL,
  original_filename VARCHAR(255),
  mime_type VARCHAR(100),
  file_hash varchar(512),
  size_bytes INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  INDEX `idx_user_photos_deleted_at` (`deleted_at`),
  FOREIGN KEY (user_id) REFERENCES `dice-prod-db`.`users`(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_position UNIQUE(user_id, position,deleted_at)
);


CREATE TABLE `dice-prod-db`.`active_sessions` (
  id VARCHAR(128) NOT NULL PRIMARY KEY,
  user_id VARCHAR(128) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  user_agent VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  INDEX `idx_active_sessions_deleted_at` (`deleted_at`),
  FOREIGN KEY (user_id) REFERENCES `dice-prod-db`.`users`(id) ON DELETE CASCADE
);

CREATE TABLE `dice-prod-db`.`email_verification_sessions` (
    id VARCHAR(128) NOT NULL PRIMARY KEY,
    user_id VARCHAR(128) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    verified_at TIMESTAMP NULL DEFAULT NULL,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    INDEX `idx_email_verification_sessions_deleted_at` (`deleted_at`),
    FOREIGN KEY (user_id) REFERENCES `dice-prod-db`.`users`(id) ON DELETE CASCADE
);

CREATE TABLE  `dice-prod-db`.`password_reset_sessions` (
    id VARCHAR(128) NOT NULL PRIMARY KEY,
    user_id VARCHAR(128) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    used_at TIMESTAMP NULL DEFAULT NULL,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    INDEX `idx_password_reset_sessions_deleted_at` (`deleted_at`),
    FOREIGN KEY (user_id) REFERENCES `dice-prod-db`.`users`(id) ON DELETE CASCADE
);

CREATE TABLE `dice-prod-db`.`games` (
  id VARCHAR(128) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  INDEX `idx_games_deleted_at` (`deleted_at`),
  FOREIGN KEY (user_id) REFERENCES `dice-prod-db`.`users`(id) ON DELETE CASCADE
);

CREATE TABLE `dice-prod-db`.`user_games` (
  id VARCHAR(128) NOT NULL PRIMARY KEY,
  user_id VARCHAR(128) NOT NULL,
  game_id VARCHAR(128) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  INDEX `idx_user_games_deleted_at` (`deleted_at`),
  FOREIGN KEY (user_id) REFERENCES `dice-prod-db`.`users`(id) ON DELETE CASCADE,
  FOREIGN KEY (game_id) REFERENCES `dice-prod-db`.`games`(id) ON DELETE CASCADE
);

CREATE TABLE `dice-prod-db`.`swipes` (
  id VARCHAR(128) NOT NULL PRIMARY KEY,
  swiper_id VARCHAR(128) NOT NULL,
  swiped_id VARCHAR(128) NOT NULL,
  action ENUM('like', 'dislike') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  INDEX `idx_swipes_deleted_at` (`deleted_at`),
  FOREIGN KEY (swiper_id) REFERENCES `dice-prod-db`.`users`(id) ON DELETE CASCADE,
  FOREIGN KEY (swiped_id) REFERENCES `dice-prod-db`.`users`(id) ON DELETE CASCADE,
  UNIQUE (swiper_id, swiped_id, deleted_at)
);

CREATE TABLE `dice-prod-db`.`conversations` (
  id VARCHAR(128) NOT NULL PRIMARY KEY,
  user1_id VARCHAR(128) NOT NULL,
  user2_id VARCHAR(128) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  INDEX `idx_conversations_deleted_at` (`deleted_at`),
  FOREIGN KEY (user1_id) REFERENCES `dice-prod-db`.`users`(id) ON DELETE CASCADE,
  FOREIGN KEY (user2_id) REFERENCES `dice-prod-db`.`users`(id) ON DELETE CASCADE,
  UNIQUE (user1_id, user2_id, deleted_at)
);

CREATE TABLE `dice-prod-db`.`messages` (
  id VARCHAR(128) NOT NULL PRIMARY KEY,
  conversation_id VARCHAR(128) NOT NULL,
  sender_id VARCHAR(128) NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  INDEX `idx_messages_deleted_at` (`deleted_at`),
  FOREIGN KEY (conversation_id) REFERENCES `dice-prod-db`.`conversations`(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES `dice-prod-db`.`users`(id) ON DELETE CASCADE
);


insert into `dice-prod-db`.`games` (id, name, description) values
(uuid(), 'Chess', 'A two-player strategy board game played on an 8x8 grid.'),
(uuid(), 'Monopoly', 'A real estate trading game where players buy and sell properties.'),
(uuid(), 'Scrabble', 'A word game where players create words on a board using letter tiles.'),
(uuid(), 'Risk', 'A strategy board game of diplomacy, conflict, and conquest.'),
(uuid(), 'Settlers of Catan', 'A resource management game where players build settlements and cities.'),
(uuid(), 'Clue', 'A mystery game where players solve a murder case through deduction.'),
(uuid(), 'Ticket to Ride', 'A railway-themed board game where players collect train cards.'),
(uuid(), 'Uno', 'A card game where players try to be the first to play all their cards.'),
(uuid(), 'Battleship', 'A guessing game where players try to sink each others ships.'),
(uuid(), 'Apples to Apples', 'A party game where players match nouns to adjectives.'),
(uuid(), 'Dominion', 'A deck-building card game where players acquire cards to build their kingdom.'),
(uuid(), 'Puerto Rico', 'A strategy game where players develop plantations and trade goods.'),
(uuid(), 'Yahtzee', 'A dice game where players roll for specific combinations to score points.'),
(uuid(), 'Trivial Pursuit', 'A trivia board game where players answer questions in various categories.'),
(uuid(), 'Stratego', 'A strategy board game where players move pieces to capture the opponents flag.'),
(uuid(), 'Checkers', 'A classic strategy game played on an 8x8 board with jumping moves.'),
(uuid(), 'Sorry!', 'A board game where players race their pawns around the board.'),
(uuid(), 'Agricola', 'A farming strategy game where players build and manage their homestead.'),
(uuid(), 'Carcassonne', 'A tile-placement game where players build landscapes and claim territories.'),
(uuid(), 'Pictionary', 'A drawing game where players guess words from sketched clues.'),
(uuid(), 'Pandemic', 'A cooperative game where players work together to stop global diseases.'),
(uuid(), 'Connect Four', 'A connection game where players drop checkers to get four in a row.'),
(uuid(), 'Go', 'An ancient strategy game where players place stones to control territory.'),
(uuid(), 'Backgammon', 'A race game where players move pieces based on dice rolls.'),
(uuid(), 'Arkham Horror', 'A cooperative horror game set in H.P. Lovecrafts universe.'),
(uuid(), 'Axis and Allies', 'A World War II strategy game with global military campaigns.'),
(uuid(), 'Power Grid', 'An economic game where players build power plants and supply cities.'),
(uuid(), 'The Game of Life', 'A family board game simulating a persons journey through life.'),
(uuid(), 'Candyland', 'A simple childrens board game with a candy-themed path.'),
(uuid(), 'A Game of Thrones', 'A strategy game based on George R.R. Martins fantasy series.'),
(uuid(), 'Battlestar Galactica', 'A cooperative game with hidden traitor mechanics.'),
(uuid(), 'Cosmic Encounter', 'A space-themed game where alien powers break the rules.'),
(uuid(), 'Smallworld', 'A fantasy game where players control declining civilizations.'),
(uuid(), 'Twilight Struggle', 'A Cold War strategy game for two players.'),
(uuid(), 'Trouble', 'A board game where players race around a track popping dice.'),
(uuid(), 'Tigris and Euphrates', 'A tile-laying civilization game set in ancient Mesopotamia.'),
(uuid(), '7 Wonders', 'A card drafting game where players build ancient civilizations.'),
(uuid(), 'Twilight Imperium', 'An epic space opera board game with galactic conquest.'),
(uuid(), 'Chinese Checkers', 'A strategy game where players move marbles across a star-shaped board.'),
(uuid(), 'Mastermind', 'A code-breaking game where players guess secret color patterns.'),
(uuid(), 'Cranium', 'A party game combining trivia, word games, and creative challenges.'),
(uuid(), 'El Grande', 'A strategy game about medieval Spanish politics and area control.'),
(uuid(), 'Dont Break the Ice', 'A childrens game where players carefully remove ice blocks.'),
(uuid(), 'Scattergories', 'A word game where players name items in categories starting with specific letters.'),
(uuid(), 'Dixit', 'A storytelling game where players guess which image matches a clue.'),
(uuid(), 'Mahjong', 'A traditional Chinese tile-based game of skill and chance.'),
(uuid(), 'Say Anything', 'A party game where players write answers to unusual questions.'),
(uuid(), 'Dominoes', 'A tile game where players match numbers on rectangular tiles.'),
(uuid(), 'Dominant Species', 'An evolutionary strategy game where species adapt to survive.'),
(uuid(), 'Cards Against Humanity', 'An adult party game with irreverent humor and fill-in-the-blank cards.'),
(uuid(), 'Guess Who?', 'A guessing game where players identify mystery characters through questions.'),
(uuid(), 'Dungeon!', 'A fantasy adventure game where heroes explore dungeons for treasure.'),
(uuid(), 'Reversi / Othello', 'A strategy game where players flip discs to control the board.'),
(uuid(), 'Mancala', 'An ancient counting game played with seeds or stones in pockets.'),
(uuid(), 'The Invasion of Canada', 'A historical war game set during the War of 1812.'),
(uuid(), 'Taboo', 'A word-guessing game where certain words are forbidden.'),
(uuid(), 'Diplomacy', 'A strategy game of negotiation set in pre-World War I Europe.'),
(uuid(), 'Descent: Journeys in the Dark', 'A dungeon-crawling adventure game with miniatures.'),
(uuid(), 'Hi Ho! Cherry-O', 'A counting game for young children featuring fruit trees.'),
(uuid(), 'Wits and Wagers', 'A trivia game where players bet on the best answers.'),
(uuid(), 'Caylus', 'A medieval building game where players construct a castle town.'),
(uuid(), 'Key to the Kingdom', 'A fantasy adventure game with multiple paths to victory.'),
(uuid(), 'Chutes and Ladders', 'A childrens board game with shortcuts up and slides down.'),
(uuid(), 'Blood Bowl', 'A fantasy football game with violence and strategy.'),
(uuid(), 'Uno Attack', 'A variation of Uno with an electronic card shooter.'),
(uuid(), 'Shogun', 'A strategy game set in feudal Japan with area control mechanics.'),
(uuid(), 'Operation', 'A skill game where players perform surgery without touching the sides.'),
(uuid(), 'Through the Ages', 'A civilization game spanning from antiquity to modern times.'),
(uuid(), 'Pay Day', 'A board game simulating monthly budgets and financial decisions.'),
(uuid(), 'Shadows Over Camelot', 'A cooperative Arthurian game with potential traitors.'),
(uuid(), 'Alhambra', 'A tile-laying game where players build palaces with different currencies.'),
(uuid(), 'Balderdash', 'A bluffing game where players create fake definitions for real words.'),
(uuid(), 'Le Havre', 'An economic game about building and developing a French port city.'),
(uuid(), 'Acquire', 'A business game where players buy stock in hotel chains.'),
(uuid(), 'Scotland Yard', 'A pursuit game where detectives chase a hidden criminal through London.'),
(uuid(), 'Summoner Wars', 'A tactical card game with fantasy armies battling on a grid.');