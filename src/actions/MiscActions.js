import {SET_CONFIG,TOGGLE_WHAT_IS_THIS,SHOW_TOUR} from "../consts"

import ApolloClient from "apollo-boost";
import gql from "graphql-tag";

const client = new ApolloClient({
    uri: "http://127.0.0.1:4000"
});

export const toggleWhatIsThis = (toggleWhatIsThis) => {
    return {
        type: TOGGLE_WHAT_IS_THIS,
        open: toggleWhatIsThis
    }
}

export const toggleTour = (toggleTour) => {
    return {
        type: SHOW_TOUR,
        tourActive: toggleTour
    }
}


export function testButton() {
    client.query({
        query: gql`
                {
                    books {
                        title
                        author
                    }
                }
            `
    }).then(result => console.log(result));

}

export function testButton2() {
    client.query({
        query: gql`
            {
                vidoes {
                    title
                }
            }
            `
    }).then(result => console.log(result));

}

