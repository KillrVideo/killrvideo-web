import React from 'react';
import {Row,Col,FormGroup, FormControl,ControlLabel,HelpBlock} from 'react-bootstrap';


// ToDo:
//add retype password part and validation to go with
//remove bad value handle from event handler


// this input element takes the following props
// value - default value for the input *Optional*
// controlId - ids for the elements
// name - name
// type - text,file,email,password,
// helpblock - the text for the help block *Optional*

class Input extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.handleChange = this.handleChange.bind(this);
        this.setValidationState = this.setValidationState.bind(this);
        this.state = {
            value: "",
            retypePassword:"",
            name:props.name,
            error:null
         }
    }


    setValidationState(errorState) {
        //valid values success,warning,error,null
        this.setState({
            ...this.state,
            error: errorState
        });
    }

    handleChange(event) {
        // custom form validation
        var value = event.target.value;
        switch(this.props.type) {
            case "newPassword":
                if (event.target.name !== "retypePassword") {
                    this.setState({
                        ...this.state,
                        value: value
                    });
                }else{
                    this.setState({
                        ...this.state,
                        retypePassword: value
                    });
                }
                if (value !=="" &&(
                    (value === this.state.value && event.target.name === "retypePassword")
                    ||
                    (value === this.state.retypePassword && event.target.name === this.state.name)
                )){
                    //if the values and password retype match then submit value
                    var x = {
                    ...event,
                        target:{
                            ...event.target,
                            name:this.state.name
                        }
                    }
                    this.props.onChange(x);
                    // this.setValidationState('success');
                    console.log("passwords match")
                }else {
                    // if (value ==="") {
                    //     this.setValidationState(null);
                    // }else {
                    //     this.setValidationState('error');
                    // }
                    //if the values and password retype don't match then clear value
                    var x = {
                        ...event,
                        target:{
                            ...event.target,
                            name:this.state.name,
                            value:""
                        }
                    }
                    this.props.onChange(x);
                    console.log("passwords don't match")
                }
                break;
            case "password":
                if (value.length < 3){
                    this.setValidationState('warning');
                }else{
                    this.setValidationState('success');
                }
                this.props.onChange(event);
                break;
            case "text":
                if (value.length < 3){
                    this.setValidationState('warning');
                }else{
                    this.setValidationState('success');
                }
                this.props.onChange(event);
                break;
            case "email":
                var pattern = new RegExp(/^(("[\w-+\s]+")|([\w-+]+(?:\.[\w-+]+)*)|("[\w-+\s]+")([\w-+]+(?:\.[\w-+]+)*))(@((?:[\w-+]+\.)*\w[\w-+]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][\d]\.|1[\d]{2}\.|[\d]{1,2}\.))((25[0-5]|2[0-4][\d]|1[\d]{2}|[\d]{1,2})\.){2}(25[0-5]|2[0-4][\d]|1[\d]{2}|[\d]{1,2})\]?$)/i);
                if(value === ""){
                    this.setValidationState(null);
                } if (!pattern.test(value)){
                    this.setValidationState('warning');
                }else {
                    this.props.onChange(event);
                    this.setValidationState('success');
                }
                break;
            case "file":
                this.props.onChange(event);
                this.setValidationState('success');
                break;
            default:
                console.log("not a valid type for input element");
        }
    }

    render() {
        return (
            <div>
                <Row>
                    <FormGroup
                        controlId={this.props.controlId}
                        validationState={this.state.error}
                    >
                        <Col componentClass={ControlLabel} sm={2}>
                            {this.props.label + (this.props.required ? "*" : "")}
                        </Col>
                        <Col sm={10}>
                            <FormControl
                                type={this.props.type == "newPassword" ? "password" : this.props.type}
                                name={this.props.name}
                                required={this.props.required}
                                value={this.props.type == "newPassword" ? this.state.value : this.props.value}
                                placeholder={this.props.label}
                                onChange={(e) => { this.handleChange(e)}}
                            />
                        </Col>
                        <HelpBlock>{this.props.helpblock}</HelpBlock>
                    </FormGroup>
                </Row>
                {this.props.type == "newPassword" ?
                    <Row>
                        <FormGroup
                            controlId={this.props.controlId+"retype"}
                            validationState={this.state.error}
                        >
                            <Col componentClass={ControlLabel} sm={2}>
                                Retype Password*
                            </Col>
                            <Col sm={10}>
                                <FormControl
                                    type="password"
                                    name="retypePassword"
                                    value={this.state.retypePassword}
                                    placeholder="Retype Password"
                                    onChange={(e) => { this.handleChange(e)}}
                                />
                            </Col>
                        </FormGroup>
                    </Row>
                    :null
                }
            </div>
        );
    }
}

export default Input;