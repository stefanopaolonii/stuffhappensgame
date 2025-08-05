import PropTypes from "prop-types";
import { Col, Container, Row } from "react-bootstrap/";
import { LogoutButton, LoginButton } from './Auth';

// Custom Header Component
function Header(props){
    return (
        <header className="custom-header">
            <Container fluid>
                <Row className="align-items-center py-3">
                    <Col xs={8} md={10}>
                        <a href="/" className="custom-link">
                            <div className="custom-icon">
                                🎮
                            </div>
                            <div className="custom-text">
                                <span className="custom-title">StuffHappens</span>
                                <small className="custom-subtitle">The Card Game</small>
                            </div>
                        </a>
                    </Col>
                    <Col xs={4} md={2} className="d-flex align-items-center justify-content-end">
                        {props.loggedIn
                            ? <LogoutButton logout={props.logout} />
                            : <LoginButton />}
                    </Col>
                </Row>
            </Container>
        </header>
    );
}

Header.propTypes = {
    loggedIn: PropTypes.bool,
    logout: PropTypes.func
};

export default Header;