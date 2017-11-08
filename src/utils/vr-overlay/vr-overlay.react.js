import React, { PureComponent } from 'react';
import IsMobile from 'ismobilejs';

import ProjectionDome from './projection-dome';
require('./sass/vr-overlay.sass');

export default class VROverlay extends PureComponent {

  constructor(props) {
    super(props);
    this.showLonLat = true;
    
    this.state = {
      vrZoom: 0,
      lon: props.position.lon,
      lat: props.position.lat,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.splits !== nextProps.splits) {
      this.resizeProjectDome();
    }

    this.setState({
      lon: nextProps.position.lon,
      lat: nextProps.position.lat,
    })
  }

  componentDidMount() {
    let passiveSupported = false;

    try {
      const options = Object.defineProperty({}, "passive", {
        get: function() {
          passiveSupported = true;
        }
      });

      window.addEventListener('test', null, options);
    } catch(err) {}

    this.refs.controlsOverlay.addEventListener('mousewheel', this._handleMouseScroll.bind(this), passiveSupported ? {passive: true} : false);
    this.refs.controlsOverlay.addEventListener('DOMMouseScroll', this._handleMouseScroll.bind(this), passiveSupported ? {passive: true} : false);

    window.addEventListener('resize', this.resizeProjectDome.bind(this));
  }

  componentWillUnmount() {
    this.refs.controlsOverlay.removeEventListener('mousewheel', this._handleMouseScroll.bind(this));
    this.refs.controlsOverlay.removeEventListener('DOMMouseScroll', this._handleMouseScroll.bind(this));

    window.removeEventListener('resize', this.resizeProjectDome.bind(this));

    this.p.destroy();
  }

  render() {
    return (
      <div className='vr-overlay' style={this.props.style}>
        <div ref='canvasContainer' className='vr-canvas-container' />
        { this.renderControls() }
      </div>
    );
  }

  renderControls() {
    const styles = {
      root: {
        display: 'flex',
        height: 124,
        flexDirection: 'row',
        justifyContent: 'space-around',
      },
    };

    return (
      <div
        ref='controlsOverlay'
        className='vr-controls'
        onMouseDown={this._handleMouseDown.bind(this)}
        onMouseUp={this._handleMouseUp.bind(this)}
        onMouseMove={this._handleMouseMove.bind(this)}
        onTouchStart={this._handleTouchStart.bind(this)}
        onTouchEnd={this._handleTouchEnd.bind(this)}
        onTouchMove={this._handleTouchMove.bind(this)}
        onClick={this._handleMouseClick.bind(this)} >
        {
          this.showLonLat &&
          <div className='debug'>
            <div>{`lon: ${this.state.lon.toFixed(2)}, lat: ${this.state.lat.toFixed(2)}`}</div>
          </div>
        }
        {
          this.props.split === 1 &&
          <div className='control-panel'>
            <div className='top'>
              <i className='zmdi zmdi-keyboard_arrow_up' onClick={this._moveVR.bind(this, 'up')} />
            </div>
            <div className='middle'>
              <i className='zmdi zmdi-chevron-left' onClick={this._moveVR.bind(this, 'left')} />
              <i className='zmdi zmdi-chevron-right' onClick={this._moveVR.bind(this, 'right')} />
            </div>
            <div className='bottom'>
              <i className='zmdi zmdi-keyboard_arrow_down' onClick={this._moveVR.bind(this, 'down')} />
            </div>
          </div>
        }
        {
          this.props.split === 1 &&
          <div className='zoom-panel'>
            <div style={styles.root}>
              {/* <Slider style={{height: 100}} axis="y" defaultValue={this.state.vrZoom} value={this.state.vrZoom} onChange={this._handleSliderChange.bind(this)} /> */}
            </div>
          </div>
        }
      </div>
    );
  }

  destroy() {
    if (this.p) {
      this.p.destroy();
    }
  }

  videoElementReady(videoElement) {
    const h = this._determineHeight();

    this.p = new ProjectionDome( this.refs.canvasContainer, h * 16 / 9, h, videoElement, {
      inverseHPanning: true,
      inverseVPanning: true,
      speedX: 0.1,
      speedY: 0.1,
      lon: this.props.position.lon,
      lat: this.props.position.lat,
      mouseSensitivityX: IsMobile.phone ? 0.5 : 0.1,
      mouseSensitivityY: IsMobile.phone ? 0.5 : 0.1,
    });

    this.p.onloadeddata();
  }

  resizeProjectDome() {
    const newHeight = this._determineHeight();

    this.p.resize(newHeight * 16 / 9, newHeight)
  }

  _determineHeight() {
    if (!this.refs.canvasContainer) {
      return;
    }

    return this.props.splits === 2 ? this.refs.canvasContainer.offsetHeight / 2 : this.refs.canvasContainer.offsetHeight;
  }

  _handleSliderChange(e, value) {
    this.setState({
      vrZoom: value,
    });

    this.p.setZoom(value);
  }

  _handleMouseClick(e) {
    if (this.mouseMoveFired) {
      this.mouseMoveFired = false;
      return;
    }

    if (!this.props.togglePausePlay) {
      return;
    }

    const classList = Array.prototype.slice.call(e.target.classList);
    if (classList.indexOf('zmdi') >= 0 || classList.indexOf('button') >= 0) {
      return;
    }

    this.props.togglePausePlay();
  }

  _handleMouseDown(e) {
    let isRightMB = false;
    if ('which' in e) { // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
      isRightMB = e.which === 3;
    } else if ('button' in e) { // IE, Opera 
      isRightMB = e.button === 2;
    }

    if (isRightMB) {
      return;
    }

    this.mouseDown = true;
    this.p.onMouseDown(e);
  }

  _handleTouchStart(e) {
    let isRightMB = false;
    if ('which' in e) { // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
      isRightMB = e.which === 3;
    } else if ('button' in e) { // IE, Opera 
      isRightMB = e.button === 2;
    }

    if (isRightMB) {
      return;
    }

    this.mouseDown = true;
    this.p.onMouseDown(e.changedTouches[0]);
    document.getElementsByTagName('body')[0].style.setProperty('overflow', 'hidden');
  }

  _handleMouseUp(e) {
    this.mouseDown = false;

    this.p.onMouseUp(e);
    this.props.onPositionUpdate(this.props.splitIndex, { lon: this.state.lon, lat: this.state.lat });
    
  }

  _handleTouchEnd(e) {
    this.mouseDown = false;

    this.p.onMouseUp(e.changedTouches[0]);
    document.getElementsByTagName('body')[0].style.setProperty('overflow', 'auto');
  }

  _handleMouseScroll(e) {
    this.p.onMouseWheel(e);

    this.setState({
      vrZoom: this.p.getZoom(),
    });
  }

  _handleMouseMove(e) {
    if (!this.mouseDown) {
      return;
    }

    this.mouseMoveFired = true;
    this.p.onMouseMove(e, (newLon, newLat) => {
      this.setState({ lon: newLon, lat: newLat });
    });
  }

  _handleTouchMove(e) {
    if (!this.mouseDown) {
      return;
    }

    this.mouseMoveFired = true;
    this.p.onMouseMove(e.changedTouches[0]);
  }

  _moveVR(direction) {
    const opt = { animated: true };

    switch(direction) {
      case 'up': {
        this.p.moveY(0.1, opt);
        break;
      }
      case 'right': {
        this.p.moveX(-0.1, opt);
        break;
      }
      case 'down': {
        this.p.moveY(-0.1, opt);
        break;
      }
      case 'left': {
        this.p.moveX(0.1, opt);
        break;
      }
    }
  }
}
