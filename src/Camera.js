'use strict';

import React, { Component } from 'react';
// import Hls from 'forked.hls.js';
import './Camera.css';

export default class extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  render() {
    return (
      <div className='camera' data-active={this.props.active} onClick={this._cameraClick.bind(this, this.props.index)} >
        <div className='overlay'>
          <div className='camera-name'>{this.props.camera.name}</div>
        </div>
        <img src={this.props.camera.thumbnail} />
      </div>
    )
    
  }

  _cameraClick(index) {
    this.props.onCameraChange(index);
  }

}