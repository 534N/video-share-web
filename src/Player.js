import React, { PureComponent } from 'react';
import Hls from 'connect-hls.js';
import VROverlay from './utils/vr-overlay/vr-overlay.react.js';
import classNames from 'classnames';

import './styles/Player.css';
import './utils/vr-overlay/sass/vr-overlay.css';

export default class extends PureComponent {
  constructor(props) {
    super(props);
    this.totalSplits = 4;

    this.splitStyles = {
      'split-1': [
        {},
      ],
      'split-2': [
        { top: 0, left: 0, width: '50%' },
        { top: 0, left: '50%', width: '50%' },
      ],
      'split-3': [
        { top: 0, left: 0, width: '50%', height: '50%' },
        { top: 0, left: '50%', width: '50%', height: '50%' },
        { top: '50%', left: 0, width: '50%', height: '50%' },
      ],
      'split-4': [
        { top: 0, left: 0, width: '50%', height: '50%' },
        { top: 0, left: '50%', width: '50%', height: '50%' },
        { top: '50%', left: 0, width: '50%', height: '50%' },
        { top: '50%', left: '50%', width: '50%', height: '50%' },
      ],
    };

    this.initPositions =  {
      'split-1': [
        { lon: -180, lat: 30 },
      ],
      'split-2': [
        { lon: -180, lat: 30 },
        { lon: 1, lat: 30 },
      ],
      'split-3': [
        { lon: -180, lat: 30 },
        { lon: -60, lat: 30 },
        { lon: 60, lat: 30 },
      ],
      'split-4': [
        { lon: -180, lat: 30 },
        { lon: -90, lat: 30 },
        { lon: 1, lat: 30 },
        { lon: 90, lat: 30 },
      ],
    };

    const initSplit = 1;
    this.state = {
      splits: initSplit,
      style: this.splitStyles[this._getSplitName(initSplit)],
      position: JSON.parse(localStorage.getItem(this._getLocalStorageKey(initSplit))) || this.initPositions[this._getSplitName(initSplit)],
    };
  }

  componentDidMount() {
    this._initHLS(this.props.url);
    
    if (this.props.is360) {
      this._init360();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.url !== prevProps.url) {
      this._initHLS(this.props.url);
    }

    if (this.props.is360) {
      this._destroy360();
      this._init360();
    }
  }

  render() {
    return (
      <div className='video-wrap'>
        {
          this.props.is360 &&
          <div className='overlay'>
            <div className='vr-banner'>
              <i className='zmdi zmdi-360vr' />
              {
                this._renderSplits()
              }
            </div>
          </div>
        }
        {
          this.props.is360 &&
          <div className='mask' />
        }
        
        <video
          className='player'
          ref='player'
          src={this.props.url}
          autoPlay={true}
          controls={true} />
        { this.props.is360 && this._render360() }
      </div>
    )
  }

  _renderSplits() {
    let splitToggles = [];
    for(let i=1; i<=this.totalSplits; i++) {
      if (i === 3) {
        continue;
      }

      const splitClass = classNames(
        'split',
        {
          active: i === this.state.splits,
        }
      );

      const iconClass = classNames(
        'zmdi',
        {
          'zmdi-filter_none': i === 1,
          'zmdi-flip': i === 2,
          'zmdi-border_inner': i === 4,
        }
      );

      splitToggles.push(
        <div className={splitClass} key={`split-toggle-${i}`} onClick={this._toggleSplit.bind(this, i)}>
          <i className={iconClass} />
        </div>
      );
    }

    return splitToggles;
  }

  _render360() {
    return (
      <div>
        { this._renderVROverlay() }
      </div>
    );
  }

  _renderVROverlay() {
    let splits = [];

    for(let i=1; i<=this.state.splits; i++) {

      const splitIndex = this._getSplitIndex(i);
      const style = this.state.style[splitIndex];
      const position = this.state.position[splitIndex];

      splits.push(
        <VROverlay
          ref={`vrOverlay-${i}`}
          key={`vrOverlay-${i}`}
          style={style}
          position={position}
          splits={this.state.splits}
          splitIndex={splitIndex}
          onPositionUpdate={this._updatePositions.bind(this)}
          togglePausePlay={this.props.togglePausePlay} />
      )
    }

    return splits;
  }

  _updatePositions(splitIndex, newPos) {
    const position = this.state.position;

    position[splitIndex] = newPos;

    localStorage.setItem(this._getLocalStorageKey(this.state.splits), JSON.stringify(position));

    this.setState({
      position: position,
    });
  }

  _toggleSplit(newSplit) {
    this.setState({
      splits: newSplit,
      style: this.splitStyles[this._getSplitName(newSplit)],
      position: JSON.parse(localStorage.getItem(this._getLocalStorageKey(newSplit))) || this.initPositions[this._getSplitName(newSplit)],
    });
  }

  _initHLS(url) {
    const config = {
      xhrSetup: (xhr, url) => {
        xhr.withCredentials = true;
      },
      debug: false,
    };

    if (this.hls) {
      this.hls.destroy();
    }

    if (Hls.isSupported()) {
      const video = this.refs.player;
      this.hls = new Hls(config);
      this.hls.loadSource(url);
      this.hls.attachMedia(video);
      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const playPromise = video.play();

        if (playPromise !== undefined) {
          playPromise.then(_ => {
            // 
          })
          .catch(error => {
            console.debug('playPromise err', error)
          });
        }
      });
    } 
  }

  _destroy360() {
    for (let i = 1; i <= this.state.splits; i++) {
      this.refs[`vrOverlay-${i}`].destroy();
    }
  }

  _init360() {
    for(let i=1; i<=this.state.splits; i++) {
      this.refs[`vrOverlay-${i}`].videoElementReady(this.refs.player);
    }
  }

  _getSplitIndex(split) {
    return split - 1;
  }

  _getLocalStorageKey(split) {
    return `SPLIT_POS_${split}`;
  }

  _getSplitName(split) {
    return `split-${split}`;
  }
}