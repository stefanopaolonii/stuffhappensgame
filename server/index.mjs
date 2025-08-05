import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';
import userDAO from './dao/userDAO.mjs';
import cardDAO from './dao/cardDAO.mjs';
import gameDAO from './dao/gameDAO.mjs';
import gamecardDAO from './dao/gamecardDAO.mjs';

const userDao = new userDAO();
const cardDao = new cardDAO();
const gameDao = new gameDAO();
const gamecardDao = new gamecardDAO();

const app = new express();
app.use(morgan('dev'));
app.use(express.json());
const port = 3001;

const corsOptions = {
  origin: 'http://localhost:5173', 
  credentials: true, 
};
app.use(cors(corsOptions));

app.use('/images', express.static('images'));

passport.use(new LocalStrategy({usernameField: 'email', passwordField: 'password'},
  async (email, password, callback) => {
  const user = await userDao.getUserByCredentials(email, password);
  if (!user) {
    return callback(null, false, 'Incorrect username or password');
  }
  return callback(null, user);
}));

passport.serializeUser((user, callback) => {
  callback(null, user);
});

passport.deserializeUser((user, callback) => {
  return callback(null, user);
});

app.use(session({
  secret: "SecretKey",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate('session'));




/*** User API ***/

app.post('/api/sessions', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ error: info });
    }
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.status(200).json(req.user);
    });
  })(req, res, next);
});

app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    return res.status(200).json(req.user);
  }
  return res.status(401).json({ error: 'Unauthorized' });
});

app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.end();
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

/*** Game API ***/

// API to start a new game
app.post('/api/game/start', async (req, res) => {
  try{
    const initialCards = await cardDao.getInitialCards();
    initialCards.sort((a, b) => a.badLuckIndex - b.badLuckIndex);
    if (req.isAuthenticated()) {
      const usedIds = initialCards.map(card => card.id);
      const initialHistory = initialCards.map(card => ({
        cardId: card.id,
        round: null,
        correct: null
      }));
      req.session.currentGame = {
        date: new Date(),
        status: 'active',
        round: 0,
        attempts: 3,
        playerCards: initialCards,
        usedIds: usedIds,
        roundHistory: initialHistory
      };

    }else {
      req.session.demoGame = {
        status: 'active',
        round: 0,
        attempts: 1,
        playerCards: initialCards,
        usedIds: initialCards.map(card => card.id),
      };
    }
    res.status(200).json({
      playerCards: initialCards,
      gameStatus: 'active'
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API to get the next round
app.post('/api/game/nextround', async (req, res) => { 
  try {
    let roundCard = null;
    if(req.isAuthenticated() && req.session.currentGame) {
      const currentGame = req.session.currentGame;
      roundCard = await cardDao.getNextRoundCard(currentGame.usedIds);
      currentGame.usedIds.push(roundCard.id);
      res.json({
        roundCard: roundCard,
        round: currentGame.round + 1,
        attempts: currentGame.attempts
      });

    }else if(req.session.demoGame) {
      const demoGame = req.session.demoGame;
      roundCard = await cardDao.getNextRoundCard(demoGame.usedIds);
      demoGame.usedIds.push(roundCard.id);
      res.json({
        roundCard: roundCard,
        round: demoGame.round + 1,
        attempts: demoGame.attempts
      });

    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API to handle the answer to a round
app.post('/api/game/answer', async (req, res) => {
  try {
    const { cardId, selectedPosition } = req.body;
    if(req.isAuthenticated() && req.session.currentGame) {
      const currentGame = req.session.currentGame;
      currentGame.round++;
      const roundCardComplete = await cardDao.getCardById(cardId);
      const roundResult = selectedPosition!=null ? checkCorrectAnswer(currentGame.playerCards, selectedPosition, roundCardComplete.badLuckIndex) : false;

      if(roundResult) {
        currentGame.roundHistory.push({
          cardId: cardId,
          round: currentGame.round,
          correct: true
        });

        currentGame.playerCards.push(roundCardComplete);
        currentGame.playerCards.sort((a, b) => a.badLuckIndex - b.badLuckIndex);

        if(currentGame.playerCards.length >= 6) {
          currentGame.status = 'won';
        }
      }else {
        currentGame.attempts--;
        currentGame.roundHistory.push({
          cardId: cardId,
          round: currentGame.round,
          correct: false
        });

        if(currentGame.attempts <= 0) {
          currentGame.status = 'lost';
        }
      }

      if(currentGame.status === 'won' || currentGame.status === 'lost') {
        const userId = req.user.id;
        const gameId = await gameDao.addGame(userId, currentGame.status, currentGame.date, currentGame.playerCards.length);
        await Promise.all(
          currentGame.roundHistory.map(round => 
            gamecardDao.addRound(gameId, round.cardId, round.round, round.correct)
          )
        );
      }

      res.json({
        gameStatus: currentGame.status,
        roundResult: roundResult,
        playerCards: currentGame.playerCards,
      });
    }else if(req.session.demoGame) {
      const demoGame = req.session.demoGame;
      const roundCardComplete = await cardDao.getCardById(cardId);
      const roundResult = selectedPosition!=null ? checkCorrectAnswer(demoGame.playerCards, selectedPosition, roundCardComplete.badLuckIndex) : false;

      if(roundResult) {
        demoGame.playerCards.push(roundCardComplete);
        demoGame.playerCards.sort((a, b) => a.badLuckIndex - b.badLuckIndex);
      }
      res.json({
        gameStatus: roundResult ? 'won' : 'lost',
        roundResult: roundResult,
        playerCards: demoGame.playerCards,
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API to get the game history of a user
app.get('/api/game/history', async (req, res) => {
  try {
    if(req.isAuthenticated()) {
      const userId = req.user.id;
      const GamesHistory = await gameDao.getGamesHistory(userId);
      res.json(GamesHistory);
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Function to check the correct answer
const checkCorrectAnswer = (playerCards, selectedPosition, badLuckIndex) => {
  let currentPosition = playerCards.length;
  for (let i = 0; i < playerCards.length; i++) {
    if(badLuckIndex < playerCards[i].badLuckIndex) {
      currentPosition = i;
      break;  
    }
  }
  return currentPosition === selectedPosition;
}