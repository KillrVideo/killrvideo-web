
import React from 'react';
import { Button, Alert } from 'react-bootstrap';
import { reduxForm } from 'redux-form';
import { validateForm } from '../../../lib/validation';

import Input from '../../shared/input';

class SignInForm extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            showValidation:true,
            errorText:" Please fill in all required fields. Required fields have a *",
            formData:{
            },
            required:{
                "signin-email":true,
                "signin-password":true

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
          {/*If you've already got an account, sign in with your email address and password below.*/}
        {/*</Alert>*/}
        {/*<Alert bsStyle="danger" className={error ? undefined : 'hidden'}>{error}</Alert>*/}
        
        <div id="signin-fields">
            <Input
                controlId="signin-email"
                name="signin-email"
                label="Email Address"
                type="email"
                required={true}
                onChange={(v) => { this.handleChange(v)}}
            />
            <Input
                controlId="signin-password"
                name="password"
                label="Password"
                type="password"
                required={true}
                onChange={(v) => { this.handleChange(v)}}
            />
        </div>
        <Button bsStyle="primary" onClick={() => {this.handleSubmit(this.state.formData, this.state.required)}}>
            Sign In
        </Button>
      </form>
    );
  }
}

export default SignInForm