import React from 'react';
import { Col, Button, Alert, FormGroup} from 'react-bootstrap';
import Input from '../../shared/Input';
import Icon from '../../shared/icon';

class RegistrationFormContainer extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            showValidation:true,
            errorText:" Please fill in all required fields. Required fields have a *",
            formData:{
            },
            required:{
                firstName:true,
                lastName:true,
                email:true,
                password:true
            }
        }
    }

    handleSubmit(formData, required){
        console.log(formData);
        var passed = true;

        Object.keys(required).forEach(function(key) {
            if (required[key] === true && !formData[key]){
                console.log("required field "+key+" is not filled in");
                passed = false;
            }
        });
        this.setState({
            ...this.state,
            showValidation: passed
        });
        if (passed === true){
            //submit values to the graphQL DSE connection.
        }
    }

    handleChange(event){
        var value = event.target.value;
        var key = event.target.name;
        this.setState({
            ...this.state,
            formData: {
                ...this.state.formData,
                [key]: value
            }
        });
    }

    render() {
        return (
            <form>
                {/*<Alert bsStyle="info" className={error ? 'hidden' : undefined}>*/}
                    {/*Register for an account to upload and comment on videos.*/}
                {/*</Alert>*/}
                {/*<Alert bsStyle="danger" className={error ? undefined : 'hidden'}>*/}
                    {/*{error}*/}
                {/*</Alert>*/}
                <div id="register-account-fields">
                    <Input
                        controlId="formHorizontalFirstName"
                        name="firstName"
                        label="First Name"
                        type="text"
                        required={true}
                        value={this.state.formData.firstName}
                        onChange={(v) => { this.handleChange(v)}}
                    />
                    <Input
                        controlId="formHorizontalLastName"
                        name="lastName"
                        label="Last Name"
                        type="text"
                        required={true}
                        value={this.state.formData.lastName}
                        onChange={(v) => { this.handleChange(v)}}
                    />
                    <Input
                        controlId="formHorizontalEmail"
                        name="email"
                        label="Email"
                        type="email"
                        required={true}
                        value={this.state.formData.email}
                        onChange={(v) => { this.handleChange(v)}}
                    />
                    <Input
                        controlId="formHorizontalPassword"
                        name="password"
                        label="Password"
                        type="newPassword"
                        required={true}
                        onChange={(v) => { this.handleChange(v)}}
                    />
                </div>
                <FormGroup>
                    <Col smOffset={2} sm={10}>
                        <Button bsStyle="primary"  onClick={() => {this.handleSubmit(this.state.formData, this.state.required)}}>
                            Register
                        </Button>
                        <a hidden={this.state.showValidation}>
                            {this.state.errorText}
                        </a>
                    </Col>
                </FormGroup>
            </form>
        );
    }
}

// Connect the form to the store
const RegistrationForm = (RegistrationFormContainer);

export default RegistrationForm