import React, { Component } from 'react';
import { Button, Form, FormGroup, Card, Input, Container, Row, Col} from 'reactstrap';
import 'bootstrap-material-design/dist/css/bootstrap-material-design.css';

export default class RequestBox extends Component {
  constructor(props){
    super(props);
    this.state = {
      name: ''
    }
    this.onChangeName = this.onChangeName.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }

  onChangeName(e){
    this.setState({name: e.target.value});
  }

  onSubmit(e) {
    e.preventDefault()
    this.props.onFilled(this.state.name)
  }

  render(){
    return(
      <Container style={{height: window.innerHeight}}>
        <Row className="h-100 align-items-center">
          <Col className="col-sm-9 col-md-7 col-lg-5 mx-auto">
            <Card body inverse style={{backgroundColor: '#333', borderRadius: 20}} className="my-5 text-center">
              {this.props.prompt}
              <Form className="text-center" onSubmit={this.onSubmit}>
                <FormGroup className="bdm-form-group my-3" autoComplete="off">
                    <Input 
                        className="text-center text-primary input-lg form-control col-sm-10 col-lg-10 col-md-10 mx-auto" 
                        name="name" 
                        id="name" 
                        onChange={this.onChangeName} 
                        autoComplete="off"
                    />
                </FormGroup>
                <FormGroup>
                  <Button className="btn-raised" color="primary" style={{borderRadius: 10}}>Submit</Button><br/>
                </FormGroup>
              </Form>
            </Card>
          </Col>
        </Row>
      </Container>
    )
  }
}