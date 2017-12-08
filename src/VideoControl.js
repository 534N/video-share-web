import React, { PureComponent } from 'react';
import CloudAPI from './utils/api.js'
import Tooltip from './Tooltip';

import './styles/VideoControl.css';

export default class extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      playing: false,
    }

    this.videoElement = {};
  }

  render() {

    return (

      <div className='video-control'>
        <div className='control progress-bar' onClick={this._handleProgressBarClick.bind(this)}>
          <div className='progress' ref='progress' />
        </div>
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
          }}>
            {
              this.state.playing &&
              <div className='control zmdi zmdi-pause' onClick={this._pause.bind(this)}/>
            }
            {
              !this.state.playing &&
              <div className='control zmdi zmdi-play' onClick={this._play.bind(this)}/>
            }
            <div className='timestamp'>{this.state.currentTimeFormatted} / {this.state.durationTimeFormatted}</div>
          </div>
          {
            !this.props.is360 && this.props.downloadURL &&
            <div className='download'>
              <a href={this.props.downloadURL}>
                <i className='icon-button white zmdi zmdi-download' style={{fontSize: '22px'}}/>
              </a>
            </div>
          }
        </div>
      </div>
    );
  }

  _handleProgressBarClick(e) {
    const {x, width} = e.currentTarget.getBoundingClientRect();
    const offsetX = e.pageX - x;

    this.refs.progress.setAttribute('style', `transform: translate(calc(-100% + ${offsetX}px), 0)`)
    this.videoElement.currentTime = (offsetX / width) * this.videoElement.duration;
  }

  handleTimeUpdate(d) {
    console.debug('time update', d.timeStamp, this.videoElement.currentTime, this.videoElement.duration)

    const currentTimeFormatted = `${this._getMin(this.videoElement.currentTime)}:${this._getSec(this.videoElement.currentTime)}`;
    const durationTimeFormatted = `${this._getMin(this.videoElement.duration)}:${this._getSec(this.videoElement.duration)}`;


    const pos = this.videoElement.currentTime / this.videoElement.duration;
    
    if (this.refs.progress) {
      this.refs.progress.setAttribute('style', `transform: translate(calc(-100% + ${pos * this.refs.progress.offsetWidth}px), 0)`)
    }

    if (!this.state.playing) {
      this.setState({
        playing: true,
      });
    }

    if (!this.state.durationTimeFormatted) {
      this.setState({
        durationTimeFormatted: durationTimeFormatted,
      });
    }

    this.setState({
      currentTimeFormatted: currentTimeFormatted,
    });
  }

  updateVideoElement(videoElement) {
    this.videoElement = videoElement;
  }

  _getMin(timeInSecond) {
    const min = parseInt(timeInSecond / 60);

    if (min < 1) {
      return '00';
    } else if (min < 10) {
      return `0${min}`;
    }

    return min;
  }

  _getSec(timeInSecond) {
    const sec = parseInt(timeInSecond % 60);

    if (sec === 0) {
      return '00';
    } else if (sec < 10) {
      return `0${sec}`;
    }

    return sec;
  }

  _pause() {
    this.videoElement.pause();
    this.setState({
      playing: false,
    });
  }

  _play() {
    this.videoElement.play();
    this.setState({
      playing: true,
    });
  }

}