'use strict';

import React, { Component } from 'react';
// import Hls from 'forked.hls.js';
import './styles/Camera.css';

export default class extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  render() {
    return (
      <div className='camera' data-active={this.props.active} data-inProgress={this.props.inProgress} onClick={this._cameraClick.bind(this, this.props.index)} >
        <div className='overlay' />
        <img src={this.props.camera.thumbnail} />
        {
          this.props.inProgress &&
          <div style={{fontSize: '12px'}}>Processing...</div>
        }
        <div className='camera-name'>{this.props.camera.name}</div>
      </div>
    )
    
  }

  _cameraClick(index) {
    this.props.onCameraChange(index);
  }

}