import PropTypes from 'prop-types';
import { Badge, Card, Col, Row } from 'react-bootstrap';

// Reusable component for displaying owned cards
export function OwnedCard(props) {
  return (
    <Card className={`custom-card ${
      props.correct === 1 ? 'custom-card-success' : 
      props.correct === 0 ? 'custom-card-danger' : 
      ''
    }`}>
      <Card.Body className='p-2'>
        <Row className="align-items-center g-2">
          {/* Round info only shown in game history */}
          {props.roundNumber && (
            <Col md={2} className="text-center">
                <small className="text-muted mb-1">Round</small>
                <Badge 
                className={`fs-6 custom-badge ${props.correct === 1 ? 'custom-badge-success' : 'custom-badge-danger'}`}
                >
                  #{props.roundNumber} {props.correct === 1 ? 'Won' : 'Lost'}
                </Badge>
            </Col>
          )}
          {/* Card image column */}
          <Col  className="text-center">
            <Card.Img 
              src={`http://localhost:3001${props.imagePath}`} 
              alt={props.name}
              style={{ 
                height: '50%', 
                width: '80%', 
                objectFit: 'cover',
              }}
            />
          </Col>
          {/* Card details column */}
          <Col md={props.roundNumber ? 6 : 8}>
            <Card.Title className="h5">{props.name}</Card.Title>
            <Card.Text>
              <Badge className='custom-badge-primary'>Bad Luck Index: {props.badLuckIndex}</Badge>
            </Card.Text>
          </Col>
          
        </Row>
      </Card.Body>
    </Card>
  );
}

OwnedCard.propTypes = {
  name: PropTypes.string,
  imagePath: PropTypes.string,
  badLuckIndex: PropTypes.number,
  roundNumber: PropTypes.number,
  correct: PropTypes.number
};