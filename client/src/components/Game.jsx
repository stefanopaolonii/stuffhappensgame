import API from '../API.mjs';
import { Container, Row, Col, Card, Alert, ProgressBar, Modal, Badge, Button } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import FeedbackContext from "../context/FeedbackContext";
import { useContext, useEffect, useState } from "react";
import {OwnedCard} from "./OwnedCard.jsx";

function Game() {
  const { setFeedback, setFeedbackFromError } = useContext(FeedbackContext);
  const [loading, setLoading] = useState(null);
  const [playerCards, setPlayerCards] = useState([]);
  const [gameStatus, setGameStatus] = useState(null);
  const [roundCard, setRoundCard] = useState(null);
  const [round, setRound] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [attempts, setAttempts] = useState(null);
  const [roundResult, setRoundResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showGameSummary, setShowGameSummary] = useState(false);

  const navigate = useNavigate();

  //Initialize the game when the component mounts
  useEffect(() => {
    startNewGame();
  }, []);

  // Function to start a new game
  const startNewGame = async () => {
    setLoading(true);
    setGameStatus(null);
    setPlayerCards([]);
    setRoundCard(null);
    setRound(null);
    setSelectedPosition(null);
    setAttempts(null);
    setRoundResult(null);
    setShowGameSummary(false);
    setShowResult(false);
    setTimeLeft(null);
    setIsTimerActive(false);
    try {
      const data = await API.startGame();
      setPlayerCards(data.playerCards);
      setGameStatus(data.gameStatus);
      await startNewRound();
    } catch (error) {
      setFeedbackFromError(error);
    } finally {
      setLoading(false);
    }
  }

  // Timer logic 
  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isTimerActive && timeLeft === 0) {
      setIsTimerActive(false);
      setSelectedPosition(null);
      sendAnswer();
    }
  }, [isTimerActive, timeLeft]);

  // Start timer
  const startTimer = () => {
    setTimeLeft(30);
    setIsTimerActive(true);
  }

  // Stop timer
  const stopTimer = () => {
    setIsTimerActive(false);
  }

  // Function to get the next round
  const startNewRound = async () => {
    setShowResult(false);
    try {
      const data = await API.getRound();
      setRoundCard(data.roundCard);
      setRound(data.round);
      setAttempts(data.attempts);
    } catch (error) {
      setFeedbackFromError(error);
    } finally {
      startTimer();
    }
  }

  // Function to send the answer
  const sendAnswer = async () => {
    try {
      setLoading(true);
      stopTimer();
      const data = await API.sendAnswer(roundCard.id, selectedPosition);
      setGameStatus(data.gameStatus);
      setRoundResult(data.roundResult);
      if (data.roundResult) {
        setPlayerCards(data.playerCards);
      }
      setShowResult(true);
      setSelectedPosition(null);
    } catch (error) {
      setFeedbackFromError(error);
    } finally {
      setLoading(false);
    }
}

  if (loading) {
    return (
      <div className="custom-page">
        {/* Loading Interface */}
      <Container className="custom-loading">
        <div className="custom-spinner" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Starting your game...</p>
      </Container>
    </div>
    );
  }
  
  return (
    <div className="custom-page">
    {/* Game Interface */}
    <Container style={{ maxWidth: '1400px' }}>
      {!showResult && roundCard  && (
        <Row className="g-4">
          {/* Left Column - Round card and stats  */}
          <Col lg={5}>
          {/*Stats card*/}
            <Card className=" custom-card-gradient mb-4">
            <Card.Body className="text-white p-3">
              <h4 className="custom-title mb-3">Game Stats</h4>
              <Row className="g-2">
                <Col xs={4}>
                                  <div className="bg-white bg-opacity-20 rounded p-2 text-center">
                      <div className="h6 fw-bold mb-1 text-dark">Round {round}</div>
                      <small className="opacity-75 text-dark">Current</small>
                    </div>
                    </Col>
                    <Col xs={4}>
                      <div className="bg-white bg-opacity-20 rounded p-2 text-center">
                        <div className="h6 fw-bold mb-1 text-dark">{playerCards.length}/6</div>
                        <small className="opacity-75 text-dark">Cards Won</small>
                      </div>
                    </Col>
                    <Col xs={4}>
                      <div className="bg-white bg-opacity-20 rounded p-2 text-center">
                        <div className="h6 fw-bold mb-1 text-dark">{attempts}</div>
                        <small className="opacity-75 text-dark">Lives Left</small>
                      </div>
                    </Col>
                <Col xs={12}>
                      <div className="bg-white bg-opacity-20 rounded p-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-semibold text-dark">Time Left</span>
                          <Badge bg={timeLeft > 15 ? 'success' : timeLeft > 8 ? 'warning' : 'danger'}>
                            {timeLeft}s
                          </Badge>
                        </div>
                        <ProgressBar 
                          now={timeLeft * 3.33} 
                          variant={timeLeft > 15 ? "success" : timeLeft > 8 ? "warning" : "danger"}
                          className="custom-progress-bar"
                        />
                      </div>
                    </Col>
              </Row>
            </Card.Body>
            </Card>
            {/* Round card */}
            <Card className="custom-card">
              <Card.Header className="text-center">
                <h5 className="mb-0 fw-bold">Current Situation</h5>
              </Card.Header>
              <Card.Body className="text-center p-3">
                <Card.Img
                  variant="top"
                  src={`http://localhost:3001${roundCard.imagePath}`}
                  alt={roundCard.name}
                  style={{ height: '200px', objectFit: 'cover' }}
                  className="mb-3"
                />
                <Card.Title className="h5 fw-bold text-dark">
                  {roundCard.name}
                  </Card.Title>
                <Card.Text className="text-muted small mb-3">
                  Guess where this situation fits in your collection based on its bad luck level (1-100)
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        
          <Col lg={7}>
          {/* Right Column - Player Cards */}
            <Card className="custom-card h-100">
              <Card.Header className="text-center">
                <h5 className="mb-0 fw-bold">Your Cards Collection</h5>
              </Card.Header>
              <Card.Body className="p-4">
                <div className="d-grid gap-2">
                  {/* Position buttons */}
                  <Button
                    onClick={() => setSelectedPosition(0)}
                    className={`position-button  ${selectedPosition === 0 ? "selected" : ""}`}
                  >
                    📍 Position 1 (Before all cards)
                </Button>
                  {playerCards.map((card, index) => (
                    <div key={card.id}>
                      <div className="mb-3">
                          <OwnedCard 
                            name={card.name} 
                            imagePath={card.imagePath} 
                            badLuckIndex={card.badLuckIndex} 
                          />
                        </div>
                      <Button
                        onClick={() => setSelectedPosition(index + 1)}
                        className={`position-button  ${selectedPosition === index + 1 ? "selected" : ""}`}
                      >
                        📍 Position {index + 2} (After "{card.name}")
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 text-center">
                  <Button
                    onClick={sendAnswer}
                    disabled={selectedPosition === null}
                    className="custom-btn custom-btn-primary custom-btn-lg"
                  >
                    Submit Guess
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Round Result Modal */}
      {showResult && roundCard && (
        <Modal 
          show={showResult} 
          onHide={() =>{ setShowResult(false);
            gameStatus === 'active' ? startNewRound() : setShowGameSummary(true);
          }} 
          centered 
          className={`custom-modal ${roundResult ? 'success' : 'danger'}`}>
          <Modal.Header>
          <Modal.Title className="fs-2 fw-bold">
            {roundResult ? '🎉 Correct!' : '❌ Wrong!'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 text-center">
          <h4 className="fw-bold mb-3">"{roundCard.name}"</h4>
          {roundResult ? (
                  <Alert variant="success" className="custom-alert custom-alert-success">
                    Great job! The card has been added to your collection.
                  </Alert>
                ) : (
                  <Alert variant="danger" className="custom-alert custom-alert-danger">
                    Better luck next time! The card was not added to your collection.
                  </Alert>
                )}
          {gameStatus === 'active' ? (
            <Button className="custom-btn custom-btn-primary custom-btn-lg" onClick={startNewRound}>
              Next Round
            </Button>
          ) : (
            <Button className="custom-btn custom-btn-primary custom-btn-lg" onClick={() =>{ setRoundResult(false) ; setShowGameSummary(true);}}>
              Game Summary
            </Button>
          )}
        </Modal.Body>
      </Modal>
      )}
      {/* Game Summary Modal */}
      <Modal show={showGameSummary} onHide={() => {setShowGameSummary(false); navigate('/')}} size="lg" centered className={`custom-modal ${gameStatus === 'won' ? 'success' : 'danger'}`}>
        <Modal.Header >
          <Modal.Title className="fs-2 fw-bold">Game Summary</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-5">
              <h1 className="display-4 fw-bold">
                {gameStatus === 'won' ? '🏆 Victory!' : '💔 Game Over'}
              </h1>
              <p className="lead text-muted">
                {gameStatus === 'won' 
                  ? 'Congratulations! You successfully collected 6 cards!' 
                  : `You made 3 wrong guesses. You collected ${playerCards.length} cards.`}
              </p>
            </div>
            <Card className="custom-card mb-4">
              <Card.Header className="text-center">
                <h4 className="mb-0 fw-bold">🏆 Your Final Collection</h4>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                    {playerCards
                      .map((card) => (
                        <OwnedCard
                          name={card.name}
                          imagePath={card.imagePath}
                          badLuckIndex={card.badLuckIndex}
                      />
                    ))}
                </Row>
              </Card.Body>
            </Card>
        <Row >
          <Col md={6} className="mb-3">
            <Button className="custom-btn custom-btn-primary custom-btn-lg w-100"  onClick={startNewGame}>
              Start New Game
            </Button>
          </Col>
          <Col md={6} className="mb-3">
            <Button className="custom-btn custom-btn-primary custom-btn-lg w-100" onClick={() => navigate('/')}>
              Go to Profile
            </Button>
          </Col>
        </Row>
        </Modal.Body>
      </Modal>
    </Container>

    </div>
  );
}

export default Game;
