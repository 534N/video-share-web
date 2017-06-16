'use strict';

import React, { Component } from 'react';
import './styles/Ghost.css';


export default class extends Component {

  constructor(props) {
    super(props);
  }

  render() {


    return (
      <div className="box">
        <div className="body-top">
          <div className="mouth"></div>
          <div className="tongue"></div>
          <div className="mouth-top"></div>
        </div>
        <div className="left-eye"></div>
        <div className="right-eye"></div>
        <div className="left-cheek"></div>
        <div className="right-cheek"></div>
        <div className="torso"></div>
        <div className="left-arm"></div>
        <div className="right-arm"></div>
        <div className="body-bottom-far-left"></div>
        <div className="body-bottom-far-right"></div>
        <div className="body-bottom-right"></div>
        <div className="body-bottom-left"></div>
        <div className="shadow"></div>
        <div className="shadow-small-left"></div>
        <div className="shadow-small-right"></div>
      </div>
    )
  }
}
