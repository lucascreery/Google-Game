import React, { Component } from 'react';
import { Button, Form, FormGroup, Card, Input, Container, Row, Col} from 'reactstrap';
import 'bootstrap-material-design/dist/css/bootstrap-material-design.css';

export default class HomeScreen extends Component {
  constructor(props){
    super(props);
    this.state={
      code: 0,
      invalidGame: true
    };
    this.onChangeCode = this.onChangeCode.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onChangeCode(e){
    this.setState({code: e.target.value});
  }

  onSubmit(e){
    e.preventDefault();
    console.log(this.state);
    window.location = '/game/' + this.state.code;
  }

  render(){
    return (
      <Container style={{height: window.innerHeight}}>
        <Row className="h-100 align-items-center">
          <Col className="col-sm-9 col-md-7 col-lg-5 mx-auto">
            <Card body inverse style={{backgroundColor: '#333', borderRadius: 20}} className="my-5">
              <h1 className="text-center row mx-auto my-0">
                <p style={{color: 'blue'}}>G</p>
                <p style={{color: 'red'}}>o</p>
                <p style={{color: 'yellow'}}>o</p>
                <p style={{color: 'blue'}}>g</p>
                <p style={{color: 'green'}}>l</p>
                <p style={{color: 'red'}}>e</p>
              </h1>
              <p className="text-center text-muted my-0">The Game</p><br/><br/>
              <Form className="text-center" onSubmit={this.onSubmit}>
                <FormGroup className="bdm-form-group" autoComplete="off">
                    <Input 
                        className="text-center text-primary input-lg form-control col-sm-3 col-lg-3 col-md-3 mx-auto" 
                        name="code" 
                        id="gameCode" 
                        onChange={this.onChangeCode} 
                        maxLength="6" 
                        placeholder="Game Code"
                        autoComplete="off"
                    />
                </FormGroup>
                <FormGroup>
                  <Button className="btn-raised" color="primary" style={{borderRadius: 10}}>Enter Game</Button><br/>
                  <Button color="primary" style={{borderRadius: 10}} onClick={() => window.location = '/host'}>New Game</Button>
                </FormGroup>
              </Form>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }
}
