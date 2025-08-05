import { useState, useContext } from 'react';
import { Alert, Button, Col, Form, Row, Card, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import PropTypes from "prop-types";
import FeedbackContext from "../context/FeedbackContext";

function Auth(props) {
  const { setFeedback, setFeedbackFromError } = useContext(FeedbackContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [show, setShow] = useState(false);

  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    const credentials = { email, password };

    props.login(credentials)
      .then(() => {
        navigate('/');
      })
      .catch((err) => {
        if(err.message === 'Unauthorized') {
          setErrorMessage('Invalid email or password');
        }else {
          setFeedbackFromError(err.message);
        }
        setShow(true);
      });
  };

  return (
    <div className="custom-page">
      <Container style={{ maxWidth: '1200px' }}>
        <Row className="g-5 align-items-center justify-content-center">
          {/* Left Column - Demo Game */}
          <Col lg={6}>
            <Card className='custom-card-gradient h-100'>
              <Card.Body className='text-white p-5'>
                <Card.Title className='custom-title'>
                  StuffHappens Demo Game
                  </Card.Title>
                <Card.Text>
                  Rules
                </Card.Text>

                <ul>
                  <li>You receive 3 initial cards with a name, image, and bad luck index (1–100).</li>
                  <li>A new situation is shown (only name and image, without the index).</li>
                  <li>You must decide where to place it among your 3 cards, based on its severity.</li>
                  <li>If you guess <b>correctly</b>, you win the card and its index is revealed.</li>
                  <li>If you guess <b>wrong</b> or time runs out, the card is discarded.</li>
                </ul>

                <Card.Text>
                  The demo game lasts for <b>one round only</b>. <br />
                  <b>To play full games, log in with an account!</b>
                </Card.Text>
                <Button 
                  className="custom-btn custom-btn-lg w-100 bg-white text-dark" 
                  onClick={() => {navigate('/demogame');}}>
                  Play Demo
                </Button>
              </Card.Body>
            </Card>
          </Col>
          {/* Right Column - Login Form */}
          <Col lg={5} >
          <Card className="custom-card h-100">
            <Card.Body className='p-5'>
              <Card.Title className='text-center '>
                <h3 className="fw-bold text-dark">Welcome Back</h3>
              </Card.Title>
              <Card.Text className="text-center mb-4">
                Login to access full games
              </Card.Text>
              <Form onSubmit={handleSubmit}>
            <Alert
              dismissible
              show={show}
              onClose={() => setShow(false)}
              variant="danger"
              className='custom-alert custom-alert-danger'
            >
              {errorMessage}
            </Alert>

            <Form.Group className="mb-4" controlId="username">
              <Form.Label className='fw-semibold text-dark'>
                Email
              </Form.Label>
              <Form.Control
                type="email"
                value={email}
                placeholder="Example: john.doe@polito.it"
                onChange={(ev) => setEmail(ev.target.value)}
                required
                size='lg'
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label className='fw-semibold text-dark'>
                Password
              </Form.Label>
              <Form.Control
                type="password"
                value={password}
                placeholder="Enter the password."
                onChange={(ev) => setPassword(ev.target.value)}
                required
                minLength={6}
                size="lg"
              />
            </Form.Group>

            <Button className="custom-btn custom-btn-primary custom-btn-lg w-100" type="submit">
              Login
            </Button>
          </Form>
            </Card.Body>
          </Card>
        </Col>

        </Row>
      </Container>
    </div>
  );
}

Auth.propTypes = {
  login: PropTypes.func,
};

// LoginButton Component
function LoginButton() {
  const navigate = useNavigate();
  return (
    <Button className="custom-btn custom-btn-outline" onClick={() => navigate('/login')}>
      Login
    </Button>
  );
}
// LogoutButton Component
function LogoutButton(props) {
  return (
    <Button className="custom-btn custom-btn-outline" onClick={props.logout}>
      Logout
    </Button>
  );
}

LogoutButton.propTypes = {
  logout: PropTypes.func,
};

export { Auth, LoginButton, LogoutButton };