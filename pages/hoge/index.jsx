/* @jsx React.createElement */
import React from "react";
import Test from "../../src/Test.jsx";

const App = (props) => {
    return (
        <div>
            <Test title={props.title} num={props.num}/>
            <h3>{props.title}</h3>
            <p>{props.num}</p>
        </div>
    );
};

export default App;