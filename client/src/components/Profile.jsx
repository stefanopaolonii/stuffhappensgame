import API from '../API.mjs';
import { Container, Row, Col, Card, Button, Badge, Accordion } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import FeedbackContext from "../context/FeedbackContext";
import { useContext, useEffect, useState } from "react";
import { OwnedCard } from "./OwnedCard";

function Profile() {
  const { setFeedback, setFeedbackFromError } = useContext(FeedbackContext);
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.getUserGames()
      .then(games => {
        setGames(games);
      })
      .catch(error => {
        setFeedbackFromError(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="custom-page">
        <Container className="custom-loading">
          <div className="custom-spinner"></div>
          <p className="mt-3 text-muted">Loading your profile...</p>
        </Container>
      </div>
    );
  }

  return (
    <div className="custom-page">
      <Container style={{ maxWidth: '1400px' }}>
        <Row className="g-4">

          {/* Left Column - Complete Game */}
          <Col lg={4}>
            <Card className="custom-card-gradient">
              <Card.Body>
                <Card.Title className="custom-title text-center">
                  StuffHappens - Complete Game
                </Card.Title>
                <Card.Text>Rules</Card.Text>
                <ul>
                  <li>You start with 3 cards</li>
                  <li>Each round, a new situation appears</li>
                  <li>Decide where to place it among your cards</li>
                  <li>You have 30 seconds to choose</li>
                  <li>If you guess <b>correctly</b>, you win the card</li>
                  <li>If you guess <b>wrong</b> or time runs out, the card is discarded.</li>
                  <li>You <b>win</b> the game if you collect <b>6 cards</b></li>
                  <li>You <b>lose</b> the game after <b>3 wrong guesses</b></li>
                </ul>
                <Card.Text className="text-center">
                  Completed games are saved in your profile
                </Card.Text>
                <Button
                  className="custom-btn custom-btn-lg w-100 bg-white text-dark"
                  onClick={() => navigate('/game')}
                >
                  Start Game
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Right Column - Game History */}
          <Col lg={8}>
            <Card className="custom-card h-100">
              <Card.Header className=" d-flex justify-content-between align-items-center">
                <h4 className="mb-0 fw-bold">Game History</h4>
                <Badge className="fs-6 text-dark bg-light custom-badge">
                  {games.length} Games
                </Badge>
              </Card.Header>
                <Card.Body className="p-4">

                {/* No games played yet */}
                {games.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="display-1 mb-3">🎮</div>
                    <h5 className="text-muted mb-3">No games played yet!</h5>
                    <p className="text-muted">Start your first game to see your progress here.</p>
                  </div>
                ) : (
                  <Accordion className="custom-accordion">
                    {games.map((game, gameIndex) => (
                      <Accordion.Item 
                        key={game.id} 
                        eventKey={gameIndex.toString()}
                        className={`mb-3 ${game.status === 'won' ? 'custom-accordion-success' : 'custom-accordion-danger'}`}
                      >
                        <Accordion.Header>
                          {/* Header with game date and cards collected */}
                          <div className="d-flex justify-content-between align-items-center w-100 me-3">
                            <div>
                              <strong className="fs-5">Game</strong>
                              <span className="small opacity-75 ms-2">
                                {new Date(game.startedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <Badge className="fs-6 text-dark bg-light custom-badge">
                              Cards Collected: {game.ownedCards}
                            </Badge>
                          </div>
                        </Accordion.Header>
                        <Accordion.Body>
                          {/* Game details */}
                          <div className="mb-3">
                            <Badge
                              className={`fs-6 custom-badge ${game.status === 'won' ? 'custom-badge-success' : 'custom-badge-danger'}`}
                            >
                              {game.status === 'won' ? 'Game Won' : 'Game Lost'}
                            </Badge>
                          </div>
                          {game.rounds && game.rounds.length > 0 ? (
                            <div className="d-grid gap-3">
                              {game.rounds.map((round, roundIndex) => (
                                <OwnedCard
                                  key={roundIndex}
                                  name={round.name}
                                  imagePath={round.imagePath}
                                  badLuckIndex={round.badLuckIndex}
                                  roundNumber={round.roundNumber}
                                  correct={round.won}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-muted mb-0">No rounds data available</p>
                            </div>
                          )}
                        </Accordion.Body>
                      </Accordion.Item>
                    ))}
                  </Accordion>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Profile;