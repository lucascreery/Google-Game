import React, { Component } from 'react';
import { Button, Card, Container, Row, Col} from 'reactstrap';
import 'bootstrap-material-design/dist/css/bootstrap-material-design.css';

export default class RequestBox extends Component {
  constructor(props){
    super(props);
    this.onSubmit = this.onSubmit.bind(this)
  }

  onSubmit(e) {
    this.props.onAnswered(e.target.id)
  }

  render(){
    return(
      <Container style={{height: window.innerHeight}}>
        <Row className="h-100 align-items-center">
          <Col className="col-sm-10 col-md-9 col-lg-10 mx-auto">
            <Card body inverse style={{backgroundColor: '#333', borderRadius: 20}} className="my-5 text-center">
              <h4>Which was written by {this.props.player}</h4><br />
              Prompt: {this.props.prompt}
              <br /><br />
              <Button 
                className="btn-raised" 
                color={this.props.colors[0]} 
                style={{borderRadius: 10, whiteSpace: "normal"}}
                id={0}
                onClick={this.onSubmit}>
                  {this.props.choice[0]}
                </Button><br/>
              <Button 
                className="btn-raised" 
                color={this.props.colors[1]}
                style={{borderRadius: 10, whiteSpace: "normal"}}
                id={1}
                onClick={this.onSubmit}>
                  {this.props.choice[1]}
                </Button><br/>
            </Card>
          </Col>
        </Row>
      </Container>
    )
  }
}